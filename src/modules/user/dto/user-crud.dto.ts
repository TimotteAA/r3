import { IsNotEmpty, IsOptional, IsUUID, IsNumber, Min, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { CustomDtoValidation } from '@/modules/core/decorators';
import { BaseUserDto } from './base-user.dto';
import { PartialType, PickType } from '@nestjs/swagger';
import { PaginateOptions } from '@/modules/utils';
import { toNumber } from 'lodash';
import { UserQueryOrder, UserDtoGroups } from '../constants';
import { toBoolean } from '@/modules/core/helpers/index';
import { IsExist } from '@/modules/database/constraints';
import { PermissionEntity, RoleEntity } from '@/modules/rbac/entities';

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

    @IsEnum(UserQueryOrder, {
        message: `排序值必须是${Object.values(UserQueryOrder).join(',')}中的一个`
    })
    @IsOptional()
    orderBy?: UserQueryOrder

    @IsBoolean({message: "isActive不是布尔类型"})
    @Transform(({value}) => toBoolean(value))
    @IsOptional()
    isActive?: boolean;
}

@CustomDtoValidation({ groups: [UserDtoGroups.CREATE] })
export class CreateUserDto extends PickType(BaseUserDto, ['username', 'nickname', 'password', 'email', 'phone']) {
    @IsBoolean()
    @Transform(({value}) => toBoolean(value))
    @IsOptional({always: true})
    actived?: boolean;

    @IsExist(RoleEntity, {
        message: "角色不存在",
        always: true,
        each: true
    })
    @IsUUID(undefined, {
        message: "角色ID格式错误",
        always: true,
        each: true
    })
    @IsOptional({always: true})
    roles?: string[]

    
    @IsExist(PermissionEntity, {
        message: "权限不存在",
        always: true,
        each: true
    })
    @IsUUID(undefined, {
        message: "权限ID格式错误",
        always: true,
        each: true
    })
    @IsOptional({always: true})
    permissions?: string[]
}

@CustomDtoValidation({ groups: [UserDtoGroups.UPDATE] })
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
