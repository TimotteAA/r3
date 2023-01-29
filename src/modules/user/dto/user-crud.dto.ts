import { IsNotEmpty, IsOptional, IsUUID, IsNumber, Min, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { CustomDtoValidation } from '@/modules/core/decorators';
import { BaseUserDto } from './base-user.dto';
import { PartialType, PickType } from '@nestjs/swagger';
import { PaginateOptions, UserDtoGroups } from '@/modules/utils';
import { toNumber } from 'lodash';
import { UserQueryOrder } from '@/modules/utils';
import { toBoolean } from '@/modules/core/helpers';

@CustomDtoValidation({ type: 'query',forbidUnknownValues: true })
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
export class CreateUserDto extends PickType(BaseUserDto, ['username', 'nickname', 'password', 'email', 'phone']) {}

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
