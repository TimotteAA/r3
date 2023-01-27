import { Injectable } from "@nestjs/common";
import { IsNotEmpty, Length, IsOptional, IsEmail, IsEnum, IsNumberString } from "class-validator";
import { CaptchaType, QueryTrashMode, UserDtoGroups, CaptchaDtoGroups } from "@/modules/utils"
import { IsUnique, IsUniqueUpdate } from "@/modules/database/constraints";
import { IsMatch, IsPassword, IsPhone } from "@/modules/core/constraints";
import { UserEntity } from "../entities";

/**
 * 与用户相关所有字段的dto类
 */
@Injectable()
export class BaseUserDto {
  // 邮箱或者用户名登录
  @Length(4, 50, {
    message: "登陆凭证长度必须为$constraint1至$constraint2之间",
    always: true,
  })
  @IsNotEmpty({ message: '登录凭证不能为空', always: true })
  credential!: string;

  @IsUniqueUpdate(UserEntity, {
    groups: [UserDtoGroups.UPDATE],
    message: '用户名重复',
  })
  @IsUnique(UserEntity, {
      groups: [UserDtoGroups.CREATE],
      message: '用户名重复',
  })
  @Length(5, 50, {
      message: '用户名的长度必须介于$constraint1与$constraint2之间',
      always: true,
  })
  @IsOptional({ groups: [UserDtoGroups.UPDATE] })
  username!: string;

  @Length(3, 20, {
    always: true,
    message: '昵称的长度必须在$constraint1与$constrain2之间',
  })
  @IsOptional({ always: true })
  nickname?: string;

  @IsUniqueUpdate(UserEntity, {
    groups: [UserDtoGroups.UPDATE],
    message: "邮箱已被注册"
  })
  @IsUnique(UserEntity, {
      groups: [UserDtoGroups.CREATE, CaptchaDtoGroups.EMAIL_REGISTER, CaptchaDtoGroups.BOUND_EMAIL],
      message: '邮箱已被注册',
  })
  @IsEmail(undefined, {
      always: true,
      message: '邮箱格式错误',
  })
  @IsOptional({ always: true, groups: [UserDtoGroups.UPDATE, UserDtoGroups.CREATE] })
  email?: string;

  @IsUniqueUpdate(UserEntity, {
    groups: [UserDtoGroups.UPDATE],
    message: "手机号已被注册"
  })
  @IsUnique(UserEntity, {
    message: "手机号已被注册",
    groups: [UserDtoGroups.CREATE, CaptchaDtoGroups.SMS_REGISTER, CaptchaDtoGroups.BOUND_SMS]
  })
  @IsPhone(undefined, {
    strict: true
  }, {
    always: true,
    message: "手机号格式错误，示例：+86.15005255555"
  })
  @IsOptional({ always:true, groups: [UserDtoGroups.CREATE, UserDtoGroups.UPDATE]})
  phone: string;

  @Length(8, 50, {
    always: true,
    message: '密码的长度必须介于$constraint1与$constraint2之间',
  })
  @IsPassword(5, {
      always: true,
      message: '密码必须包含字母、数字、特殊字符',
  })
  @IsOptional({ groups: [UserDtoGroups.UPDATE] })
  password!: string;

  @IsMatch("password", {
    message: "两次输入的密码不一致",
    always: true
  })
  @IsNotEmpty({message: "请再次输入密码", always: true})
  plainPassword!: string


  @IsEnum(QueryTrashMode)
  @IsOptional({always: true})
  trash?: boolean;

  @IsEnum(CaptchaType)
  type: CaptchaType

  @IsNumberString(undefined, {message: "验证码必须是数字", always: true})
  @Length(6, 6, {
    message: "验证码长度错误", 
    always: true
  })
  code!: string;
}