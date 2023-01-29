import { Injectable } from "@nestjs/common";
import { CustomDtoValidation } from "@/modules/core/decorators";
import { PickType } from "@nestjs/swagger";
import { BaseUserDto } from "./base-user.dto";
import { CaptchaDtoGroups, UserDtoGroups } from "@/modules/utils";

/**
 * 用户密码登录
 */
@Injectable()
@CustomDtoValidation()
export class CredentialDto extends PickType(BaseUserDto, ['credential', 'password']) {}

/**
 * 手机、验证码登录
 */
@CustomDtoValidation({ groups: [CaptchaDtoGroups.SMS_LOGIN] })
export class PhoneLoginDto extends PickType(BaseUserDto, ['phone', 'code']) {}

/**
 * 邮箱、验证码登录
 */
@CustomDtoValidation({ groups: [CaptchaDtoGroups.EMAIL_LOGIN] }) 
export class EmailLoginDto extends PickType(BaseUserDto, ['email', 'code']) {}

/**
 * 普通方式创建用户
 */
@CustomDtoValidation({groups: [UserDtoGroups.CREATE]})
export class RegisterDto extends PickType(BaseUserDto, ['username', 'nickname', 'password', 'plainPassword']) {}

/**
 * 手机、验证码注册
 */
@CustomDtoValidation({ groups: [CaptchaDtoGroups.SMS_REGISTER] })
export class PhoneRegisterDto extends PickType(BaseUserDto, ['phone', 'code']) {}

/**
 * 邮箱、验证码注册
 */
@CustomDtoValidation({ groups: [CaptchaDtoGroups.EMAIL_REGISTER] }) 
export class EmailRegisterDto extends PickType(BaseUserDto, ['email', 'code']) {}

/**
 * 手机找回密码
 */
@CustomDtoValidation({ groups: [CaptchaDtoGroups.RETRIEVE_SMS] })
export class PhoneRetrievePasswordDto extends PickType(BaseUserDto, ['phone', 'code', 'password', 'plainPassword']) {}

/**
 * 邮箱找回密码
 */
@CustomDtoValidation({ groups: [CaptchaDtoGroups.RETRIEVE_EMAIL] }) 
export class EmailRetrievePasswordDto extends PickType(BaseUserDto, ['email', 'code', 'password', 'plainPassword']) {}

/**
 * 凭证找回密码
 */
@CustomDtoValidation() 
export class CredentialRetrievePasswordDto extends PickType(BaseUserDto, ['email', 'code', 'password', 'plainPassword']) {}