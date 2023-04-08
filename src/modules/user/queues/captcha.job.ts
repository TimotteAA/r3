import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectQueue } from "@nestjs/bullmq";
import { Repository } from "typeorm";
import { CodeEntity, UserEntity } from "../entities"
import { getTime } from "@/modules/utils";
import { CaptchaActionType, CaptchaType } from "../constants";
import { CaptchaOption, UserConfig } from "../types"
import { EMAIL_CAPTCHA_JOB, SMS_CAPTCHA_JOB, SEND_CAPTCHA_QUEUE } from "../constants"
import { generateCatpchaCode, getUserConfig } from "../helpers";
import { Queue } from "bullmq";
import { UserService } from "../services";
import { CaptchaWorker } from "./captcha.worker";
import { EmailCaptchaDto, PhoneCaptchaDto, CredentialCaptchaMessageDto } from "../dto/captcha.dto";
import { isNil, toNumber } from "lodash";
import { instanceToPlain } from "class-transformer";
// import chalk from "chalk";

/**
 * 公共的发送验证码所需参数
 */
interface BaseSendParams {
  // 验证码行为：注册、登录、找回密码..
  action: CaptchaActionType;
  // 手机验证码或邮箱验证码
  type: CaptchaType;
  // 异常消息
  message?: string;
}

/**
 * 发送所需的全部参数
 * code验证码
 * message异常消息
 * type表示手机还是邮箱
 * action表示验证码目的
 */
interface SendParams extends BaseSendParams {
  media: PhoneCaptchaDto | EmailCaptchaDto;
  code?: string;
}

/**
 * 根据用户信息发
 */
interface UserSendParams extends Omit<BaseSendParams, 'type'> {
  user: UserEntity;
  type?: CaptchaType;
}

/**
 * 未登录，重置密码
 */
interface CredentialSendParams extends Omit<BaseSendParams, 'type'> {
  credential: CredentialCaptchaMessageDto['credential'];
  type?: CaptchaType;
}

interface TypeSendParams extends BaseSendParams {
  media: PhoneCaptchaDto | EmailCaptchaDto;
}



@Injectable()
export class CaptchaJob {

  constructor(
    @InjectRepository(CodeEntity) private codeRepo: Repository<CodeEntity>,
    @InjectQueue(SEND_CAPTCHA_QUEUE) private queue: Queue,
    private userService: UserService,
    private worker: CaptchaWorker
  ) {
    this.worker.addWorker();
  }

  /**
   * 根据手机、邮件添加发送消息任务
   * @param params 
   */
  async sendByMedia(params: TypeSendParams) {
    const { media, message, type, action } = params;
    const key = type === CaptchaType.SMS ? "phone" : "email";
    const condition ={ [key]: (media as any)[key] };
    // console.log("condition", condition);
    // 根据phone: xxx或者email: xxx查询用户是否存在
    const user = await this.userService.findOneByCondition(condition);
    // console.log("user", user);
    if (isNil(user)) throw new BadRequestException(`user of ${key} with ${condition[key]} does not exist`)

    return this.sendByUser({user, action, type, message});
  }

  /**
   * 通过用户名、邮箱的登陆凭证发
   * @param params 
   */
  async sendByCredential(params: CredentialSendParams) {
    const { credential, message, type, action } = params;
    const user = await this.userService.findOneByCredential(credential);
    if (isNil(user)) throw new BadRequestException(`user of ${credential} does not exist`)
    return this.sendByUser({ user, message, type, action })
  }

  /**
   * 根据用户对象发送验证码
   * @param params 
   */
  async sendByUser(params: UserSendParams) {
    const { user, message, type, action } = params;
    // 创建发生类型列表
    const types: CaptchaType[] = type ? [type] : [CaptchaType.EMAIL, CaptchaType.SMS];
    // 异步任务返回结果
    const logs: Record<string, any> = {};
    // 运行结果
    const results: Record<string, boolean> = {};
    // 错误消息
    let error = message;
    if (!error) {
      if (types.length > 1) error = "can not send sms or email for you";
      else error = "can not sent " + types[0] + ' for you'
    }
    // 生成验证码
    const code = generateCatpchaCode();
    // 遍历发生列表
    for (const type of types) {
      const key = type === CaptchaType.SMS ? "phone" : "email";
      // 存在手机号或邮箱
      if (user[key]) {
        try {
          // email: xxx or phone: xxx
          const data = { [key]: user[key] } as {
            [key in 'phone' | 'email']: string;
          }
          // 添加发送任务
          const { result, log } = await this.send({
            media: data,
            action,
            type,
            code,
          })
          // console.log(12345);
          results[key] = result;
          logs[key] = log;
        } catch (err) {
          throw new BadRequestException(err);
        }
      } 
    }
    return results;
  }
  
  /**
   * 直接发送短信，比如注册、直接登陆
   * @param params 
   */
  async send(params: SendParams) {
    const { action, code, media, message, type } = params;
    let log: any;
    const result = true;
    const captchaCode = code ?? generateCatpchaCode();
    const error = message ?? `send ${type === CaptchaType.SMS ? 'sms' : 'email'} captcha failed`;
    try {
      const captchaConfig = await getUserConfig<UserConfig['captcha']>("captcha")
      // 验证码发送配置
      const config = (captchaConfig as any)[type][action];
      // console.log(this.config.captcha[type]);
      // console.log(type, action);
      // console.log(config);
      if (isNil(config)) throw new BadRequestException(error);
      // 创建验证码
      // console.log(this.config.captcha);
      const captcha = await this.createCaptcha(media, action, type, config, captchaCode);
      const expired: number = toNumber((captchaConfig as any)[type][action]['age']);
      // console.log(chalk.red(expired));
      // 有效期设定
      // const otherVars = action === CaptchaActionType.LOGIN ? { age: Math.floor(expired / 60) } : {}
      const otherVars = { age: Math.floor(expired / 60) }
      // console.log("otherVars", otherVars);
      const jobName = type === CaptchaType.EMAIL ? EMAIL_CAPTCHA_JOB : SMS_CAPTCHA_JOB;
      await this.queue.add(jobName, {
        captcha: instanceToPlain(captcha),
        option: config,
        otherVars,
      })
      // console.log("res", res);
    } catch (err) {
      throw new BadRequestException(err);
    }
    return { result, log };
  }

  /**
   * 
   * @param data 邮箱或手机
   * @param action 验证码行为
   * @param type 手机或邮箱验证码
   * @param config 验证码配置：有效期、频率
   * @param code 
   */
  protected async createCaptcha(
    data: PhoneCaptchaDto | EmailCaptchaDto,
    action: CaptchaActionType,
    type: CaptchaType,
    config: CaptchaOption,
    code?: string,
  ) {
    // 手机号或邮箱
    const media = type === CaptchaType.SMS ? (data as PhoneCaptchaDto).phone : (data as EmailCaptchaDto).email
    // 查询验证码是否存在
    const captcha = await this.codeRepo.findOne({where: {media, type, action}});
    // 重新产生验证码
    const captchaCode = code ?? generateCatpchaCode();
    // 数据库中没有手机或者邮箱的验证码
    if (isNil(captcha)) {
      // 创建验证码对象
      return this.codeRepo.create({ media, type, action, code: captchaCode });
    }
    // 判断是否到达频率上限
    const now = await getTime();
    const canSend = now.isAfter((await getTime({date: captcha.updatedAt})).add(config.limit, "second"))
    if (!canSend) {
      throw new BadRequestException("发送验证码达到频率上限")
    }
    // 修改code
    captcha.code = captchaCode
    // await this.codeRepo.save(captcha);
    return captcha
  }
}