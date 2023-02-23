import { Injectable } from "@nestjs/common";
import { CustomDtoValidation } from "@/modules/database/decorators";
import { ApiProperty, PickType } from "@nestjs/swagger";
import { BaseUserDto } from "./base-user.dto";
import { CaptchaDtoGroups, UserDtoGroups } from "../constants";
import { Length } from "class-validator";
import { UploadFileDto } from "@/modules/media/dtos";

/**
 * 用户、邮箱、手机+密码登录
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

/**
 * 登录状态下修改密码
 */
@CustomDtoValidation()
export class UpdatePasswordDto extends PickType(BaseUserDto, ['password', 'plainPassword']) {
  @ApiProperty({
    description: "老密码",
    minLength: 8,
    maxLength: 50
  })
  @Length(8, 50, {
    always: true,
    message: '密码的长度必须介于$constraint1与$constraint2之间',
  })
  oldPassword!: string;
}

/**
 * 登录状态下绑定手机
 */
@CustomDtoValidation({ groups: [CaptchaDtoGroups.BOUND_SMS] })
export class BoundPhoneDto extends PickType(BaseUserDto, ['code', 'phone']) {}

/**
 * 登录状态下绑定邮箱
 */
@CustomDtoValidation({ groups: [CaptchaDtoGroups.BOUND_SMS] })
export class BoundEmailDto extends PickType(BaseUserDto, ['code', 'email']) {}

/**
 * 上传文件
 */
@CustomDtoValidation({ groups: ['create'] })
export class UploadAvatarDto extends PickType(UploadFileDto, ['image']) {}