import { ClassToPlain } from "../utils";
import { CodeEntity, MessageEntity } from "./entities";
import { CaptchaActionType, CaptchaType } from "./constants";

/**
 * 邮件、手机验证码通用配置
 */
export interface CaptchaOption {
  limit: number; // 验证码发送间隔
  age: number; // 验证码有效时间
}

/**
* 手机验证码选项
*/
export interface SmsCaptchaOption extends CaptchaOption {
  templateId: string; // 云厂商短信推送模板id
}

/**
* 邮箱验证码选项
*/
export interface EmailCaptchaOption extends CaptchaOption {
  subject: string; // 邮件主题
  template?: string; // 邮件模板路径
}

/**
* queue的worker的job类型
*/
export interface SendCaptchaQueueJob {
  captcha: { [key in keyof CodeEntity]: CodeEntity[key] };
  option: SmsCaptchaOption | EmailCaptchaOption;
  otherVars?: Record<string, any> & { age: number }
}

/**
* 自定义验证码配置
*/
export interface CaptchaConfig {
  [CaptchaType.SMS]?: {
      [key in CaptchaActionType]?: Partial<SmsCaptchaOption>;
  };
  [CaptchaType.EMAIL]?: {
      [key in CaptchaActionType]?: Partial<EmailCaptchaOption>;
  };
}

/**
* 保存message的data类型
*/
export type SaveMessageQueueJob = Pick<ClassToPlain<MessageEntity>, "title" | "body" | "type"> & {
  // 都是uuid?
  sender: string;
  receivers: string[]
}

/**
* JWT的payload
*/
export interface JwtPayload {
  /**
   * 用户id
   */
  sub: string;
  /**
   * 过期时间
   */
  iat: number;
}



export interface JwtConfig {
  // accessToken加密密钥
  secret: string;
  token_expired: number;
  // refreshToken加密密钥
  refresh_secret: string;
  refresh_token_expired: number;
}

