import { SmsService, SmtpService } from "@/modules/core/services";
import { Injectable } from "@nestjs/common";
import { Job, Worker } from "bullmq";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import chalk from "chalk";
import { omit } from "lodash";
import { CodeEntity } from "../entities";
import { SmtpSendParams } from "@/modules/utils";
import { EMAIL_CAPTCHA_JOB, SEND_CAPTCHA_QUEUE, SMS_CAPTCHA_JOB, } from "../constants";
import { SendCaptchaQueueJob, SmsCaptchaOption, EmailCaptchaOption } from "../types";

@Injectable()
export class CaptchaWorker {
  constructor(
    @InjectRepository(CodeEntity) private codeRepo: Repository<CodeEntity>,
    private sms: SmsService,
    private smtp: SmtpService
    ) {}

  async addWorker() {
    return new Worker(SEND_CAPTCHA_QUEUE, 
        async (job: Job<SendCaptchaQueueJob>) => {
          this.sendCode(job)
        },
        {
          concurrency: 10
        }
      )
  }

  /**
   * 发送手机或邮箱验证码
   * @param job 
   */
  protected async sendCode(job: Job<SendCaptchaQueueJob>) {
    const { captcha } = job.data;
    console.log("captcha", captcha);
    try {
      if (job.name === EMAIL_CAPTCHA_JOB || job.name === SMS_CAPTCHA_JOB) {
        if (job.name === SMS_CAPTCHA_JOB) {
          await this.sendSms(job.data);
        } else if (job.name === EMAIL_CAPTCHA_JOB) {
          await this.sendEmail(job.data);
        }
        return await this.codeRepo.save(omit(captcha, ['createtAt', 'updatetAt']))
      }
      return false;
    } catch (err) {
      console.log(chalk.red(err));
      throw new Error(err as any);
    }
  }

  /**
   * 利用腾讯云sdk发送短信
   * @param data 
   */
  protected async sendSms(data: SendCaptchaQueueJob) {
    const {
      captcha,
      option,
      otherVars
    } = data;
    const { code, media } = captcha;
    const { templateId } = option as SmsCaptchaOption;
    console.log(data);
    const result = await this.sms.send({
      PhoneNumberSet: [media],
      TemplateId: templateId,
      TemplateParamSet: this.generateParamSet(code, otherVars),
      // 会被覆盖，随便填即可
      SmsSdkAppId: "1"
    });
    console.log("Result", result)
    return result;
  }

  /**
   * 发送邮件
   * @param data 
   */
  protected async sendEmail(data: SendCaptchaQueueJob) {
    const {
        captcha: { action, media, code },
        option,
    } = data;
    const { template, subject } = option as EmailCaptchaOption;
    // name是模板名
    // subject是邮件名
    // to是发送到的对象
    // vars是验证码
    return this.smtp.send<SmtpSendParams & { template?: string }>({
        name: action,
        subject,
        template,
        html: !template,
        to: [media],
        vars: { code },
    });
  }

  protected generateParamSet(code: string, otherVars: Record<string, any> & { age: number }): string[] {
    const age = otherVars.age;
    return [code, "" + age];
  }
} 