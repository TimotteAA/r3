import { IsEmail, IsNotEmpty, IsOptional, IsUUID, Length, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { CustomDtoValidation } from '@/modules/core/decorators';
import { IsPassword } from '@/modules/core/constraints';
import { IsUnique, IsUniqueUpdate } from '@/modules/database/constraints';
import { UserEntity } from '../entities';
import { PartialType } from '@nestjs/swagger';
import { PaginateOptions } from '@/modules/database/types';
import { toNumber } from 'lodash';
import { generateRandonString } from '../helpers';

@CustomDtoValidation({ type: 'query' })
export class QueryUserDto implements PaginateOptions {
    // 给了默认值可以不传
    @Transform(({ value }) => toNumber(value))
    @Min(1, {
        message: '最少是第$constraint1页',
    })
    @IsNumber()
    @IsOptional()
    page: number = 1;

    @Transform(({ value }) => toNumber(value))
    @Min(5, {
        message: '每页最少数量是$constraint1个',
    })
    @IsNumber()
    @IsOptional()
    limit: number = 5;
}

@CustomDtoValidation({ groups: ['create'] })
export class CreateUserDto {
    @IsUniqueUpdate(UserEntity, {
        groups: ['update'],
        message: '用户名重复',
    })
    @IsUnique(UserEntity, {
        groups: ['create'],
        message: '用户名重复',
    })
    @Length(5, 50, {
        message: '用户名的长度必须介于$constraint1与$constraint2之间',
        always: true,
    })
    @IsOptional({ groups: ['update'] })
    username!: string;

    @Length(8, 50, {
        always: true,
        message: '密码的长度必须介于$constraint1与$constraint2之间',
    })
    @IsPassword(5, {
        always: true,
        message: '密码必须包含字母、数字、特殊字符',
    })
    @IsOptional({ groups: ['update'] })
    password!: string;

    @Length(3, 20, {
        always: true,
        message: '昵称的长度必须在$constraint1与$constrain2之间',
    })
    @IsOptional({ always: true })
    nickname?: string = 'nickname_' + generateRandonString();

    @IsUniqueUpdate(UserEntity, {
        groups: ['update'],
        message: '邮箱重复啦',
    })
    @IsUnique(UserEntity, {
        groups: ['create'],
        message: '邮箱重复',
    })
    @IsEmail(undefined, {
        always: true,
        message: '邮箱格式错误',
    })
    @IsOptional({ always: true })
    email?: string;
}

@CustomDtoValidation({ groups: ['update'] })
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsUUID(undefined, {
        groups: ['update'],
        message: 'ID格式错误',
    })
    @IsNotEmpty({
        groups: ['update'],
        message: 'ID不能为空',
    })
    id!: string;
}
