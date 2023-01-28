import { CaptchaActionType, CaptchaType } from "@/modules/utils";
import { Body, Controller, Post } from "@nestjs/common";
import { GUEST } from "../decorators";

import { RegisterPhoneCaptchaDto } from "../dto/captcha.dto";
import { CaptchaJob } from "../queues";

@Controller("captcha")
export class CaptchaController {
  constructor(private captchaJob: CaptchaJob) {}

  @Post("send-register-sms")
  @GUEST()
  async sendRegisterSms(@Body() data: RegisterPhoneCaptchaDto) {
    const { result } = await this.captchaJob.send({
      media: data,
      type: CaptchaType.SMS,
      action: CaptchaActionType.REGISTER,
      message: "不能发送注册短信"
    })
    return result;
  }

  @Post("send-register-email")
  @GUEST()
  async sendRegisterEmail(@Body() data: RegisterPhoneCaptchaDto) {
    const { result } = await this.captchaJob.send({
      media: data,
      type: CaptchaType.EMAIL,
      action: CaptchaActionType.REGISTER,
      message: "不能发送注册邮箱"
    })
    return result;
  }
}