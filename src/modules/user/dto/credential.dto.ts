import { IsPassword } from '@/modules/core/constraints';
import { Injectable } from '@nestjs/common';
import { IsNotEmpty, Length } from 'class-validator';

@Injectable()
export class CredentialDto {
    @IsNotEmpty({ message: '登录凭证不能为空' })
    credential!: string;

    @IsPassword(5, {
        message: '密码必须包含大小字节、数组、特殊符号',
    })
    @Length(8, 50, {
        always: true,
        message: '密码的长度必须介于$constraint1与$constraint2之间',
    })
    @IsNotEmpty({
        message: '密码不能为空',
    })
    password!: string;
}
