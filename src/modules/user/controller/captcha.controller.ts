import { Depends } from "@/modules/restful/decorators";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

import { CaptchaActionType, CaptchaType } from "../constants";
import { GUEST } from "../decorators";
import { RegisterPhoneCaptchaDto, RegisterEmailCaptchaDto, LoginPhoneCaptchaDto, LoginEmailCaptchaDto, RetrievePasswordPhoneCaptchaDto, RetrievePasswordEmailCaptchaDto, CredentialCaptchaMessageDto, BoundEmailCaptchaDto, BoundPhoneCaptchaDto } from "../dto";
import { CaptchaJob } from "../queues";
import { UserModule } from "../user.module";

@ApiTags("验证码操作")
@Depends(UserModule)
@Controller("captcha")
export class CaptchaController {
  constructor(private captchaJob: CaptchaJob) {}

  /**
   * 注册手机号
   */
  @Post("send-register-sms")
  @ApiOperation({
    summary: "发送注册验证码：手机"
  })
  @GUEST()
  async sendRegisterSms(@Body() data: RegisterPhoneCaptchaDto) {
    const { result } = await this.captchaJob.send({
      media: data,
      type: CaptchaType.SMS,
      action: CaptchaActionType.REGISTER,
      message: "不能发送短信注册验证码"
    })
    return result;
  }

  /**
   * 注册邮件
   * @param data 
   */
  @Post("send-register-email")
  @ApiOperation({
    summary: "发送注册验证码：邮箱"
  })
  @GUEST()
  async sendRegisterEmail(@Body() data: RegisterEmailCaptchaDto) {
    const { result } = await this.captchaJob.send({
      media: data,
      type: CaptchaType.EMAIL,
      action: CaptchaActionType.REGISTER,
      message: "不能发送邮箱注册验证码"
    })
    return result;
  }

  /**
   * 登陆手机号
   * @param data 
   */
  @Post("send-login-sms")
  @ApiOperation({
    summary: "发送登录验证码：手机"
  })
  @GUEST()
  async sendLoginSms(@Body() data: LoginPhoneCaptchaDto) {
    const { result } = await this.captchaJob.sendByMedia({
      media: data,
      type: CaptchaType.SMS,
      action: CaptchaActionType.LOGIN,
      message: "发送登录验证码失败"
    })
    return result;
  }

  /**
   * 登陆邮件
   * @param data 
   */
  @Post("send-login-email")
  @ApiOperation({
    summary: "发送注册验证码：邮箱"
  })
  @GUEST()
  async sendLoginEmail(@Body() data: LoginEmailCaptchaDto) {
    const { result } = await this.captchaJob.sendByMedia({
      media: data,
      type: CaptchaType.EMAIL,
      action: CaptchaActionType.LOGIN,
      message: "发送登录验证码失败"
    })
    return result;
  } 

  /**
   * 手机号找回密码
   */
  @Post("send-retrieve-password-sms")
  @ApiOperation({
    summary: "发送找回密码验证码：手机"
  })
  @GUEST()
  async retrievePasswordSms(@Body() data: RetrievePasswordPhoneCaptchaDto) {
    const { result } = await this.captchaJob.sendByMedia({
      media: data,
      type: CaptchaType.SMS,
      action: CaptchaActionType.RETRIEVE_PASSWORD,
      message: "发送找回密码验证码失败"
    })
    return result;
  }

  /**
   * 邮件找回密码
   */
    @Post("send-retrieve-password-email")
    @ApiOperation({
      summary: "发送找回密码验证码：邮箱"
    })
    @GUEST()
    async retrievePasswordEmail(@Body() data: RetrievePasswordEmailCaptchaDto) {
      const { result } = await this.captchaJob.sendByMedia({
        media: data,
        type: CaptchaType.EMAIL,
        action: CaptchaActionType.RETRIEVE_PASSWORD,
        message: "发送找回密码验证码失败"
      })
      return result;
    }

    /**
     * 通过用户名或邮箱找回，同时给手机与邮箱发
     * @param data 
     */
    @Post("send-retrieve-password")
    @ApiOperation({
      summary: "发送找回密码验证码：手机+邮箱"
    })
    @GUEST()
    async retrievePassword(@Body() data: CredentialCaptchaMessageDto) {
      const { result } = await this.captchaJob.sendByCredential({ credential: data.credential, message: "验证码发送失败", action: CaptchaActionType.RETRIEVE_PASSWORD });
      return result;
    }

    /**
     * 用户登录状态下，绑定邮箱
     * @param data 
     */
    @Post("bound-email")
    @ApiOperation({
      summary: "绑定邮箱验证码"
    })
    @ApiBearerAuth()
    async boundEmail(@Body() data: BoundEmailCaptchaDto) {
      const { result } = await this.captchaJob.send({media: data, action: CaptchaActionType.BOUND, message: "绑定邮箱失败", type: CaptchaType.EMAIL});
      return result;
    }

    /**
     * 用户登录状态下，绑定手机
     * @param data 
     */
    @Post("bound-sms")
    @ApiOperation({
      summary: "绑定手机验证码"
    })
    @ApiBearerAuth()
    async boundSms(@Body() data: BoundPhoneCaptchaDto) {
      const { result } = await this.captchaJob.send({media: data, action: CaptchaActionType.BOUND, message: "绑定手机失败", type: CaptchaType.SMS});
      return result;
    }
}