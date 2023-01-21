import { MaxLength } from 'class-validator';
import { CustomDtoValidation } from '@/modules/core/decorators';
import { IsMatch } from '@/modules/core/constraints';
import { IsPhone } from '@/modules/core/constraints/phone.constraint';

@CustomDtoValidation()
export class CreateUserDto {
    @MaxLength(20, {
        groups: ['create'],
        message: '密码最大长度为20',
    })
    password!: string;

    @IsMatch('password', { message: '两次密码不一致！' })
    @MaxLength(20, {
        groups: ['create'],
        message: '密码最大长度为20',
    })
    repassword!: string;

    @IsPhone(undefined, { strictMode: true }, { message: '手机格式错误,示例: +86.15005255555' })
    phone!: string;
}
