export enum EnvironmentType {
  TEST = "test",
  PREVIEW = "preview",
  DEVELOPMENT = "development",
  PRODUCTION = "production"
}

/**
 * crud相关的类型
 */

export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
* 软删除数据查询类型
*/
export enum QueryTrashMode {
  ALL = 'all', // 包含已软删除和未软删除的数据
  ONLY = 'only', // 只包含软删除的数据
  NONE = 'none', // 只包含未软删除的数据
}


/**
 * 验证码行为
 */
export enum CaptchaActionType  {
  // 登录
  LOGIN = "login",
  // 注册
  REGISTER = "register",
  // 找回密码
  RETRIEVE_PASSWORD = "retrieve_password",
  // 重置密码
  RESET_PASSWORD = 'reset_password',
  // 绑定手机或邮箱
  BOUND = "bound"
}

/**
 * 验证码类型：手机还是邮箱
 */
export enum CaptchaType {
  SMS = 'sms',
  EMAIL = 'email',
}

/**
 * 用户请求DTO验证组
 */
export enum UserDtoGroups {
  REGISTER = 'register',
  CREATE = 'create',
  UPDATE = 'update',
  BOUND = 'bound',
}

/**
 * 各自验证码操作
 */
export enum CaptchaDtoGroups {
  // 手机登录
  SMS_LOGIN = "sms_login",
  // 邮箱登录
  EMAIL_LOGIN = "email_login",
  // 手机注册
  SMS_REGISTER = "sms_register",
  // 邮箱注册
  EMAIL_REGISTER = "email_register",
  // 绑定手机
  BOUND_SMS = "bound_sms",
  // 绑定邮箱
  BOUND_EMAIL = "bound_email",
  // 手机找回密码
  RETRIEVE_SMS = "retrieve_sms",
  // 邮箱找回密码
  RETRIEVE_EMAIL = "retrieve_email",
  // 手机重置密码
  RESET_SMS = "reset_sms",
  // 邮箱重置密码
  RESET_EMAIL = "reset_email"
}

/**
 * 用户列表分页
 */
export enum UserQueryOrder {
  CREAT = 'createdAt',
  UPDATE = "updatedAt"
}

/**
 * 发送验证码异步列队名称
 */
export const SEND_CAPTCHA_QUEUE = 'send-captcha-queue';

/**
 * 发送短信验证码任务处理名称
 */
export const SMS_CAPTCHA_JOB = 'sms-captcha-job';

/**
 * 发送邮件验证码任务处理名称
 */
export const EMAIL_CAPTCHA_JOB = 'mail-captcha-job';