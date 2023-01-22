import { PaginateOptions } from '@/modules/database/types';
import { Transform } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';
import { toNumber } from 'lodash';
import { PartialType } from '@nestjs/swagger';
import { CustomDtoValidation } from '@/modules/core/decorators';
import { IsExist, IsUniqueTree, IsUniqueTreeUpdate } from '@/modules/database/constraints';
import { CategoryEntity } from '../entities';

@CustomDtoValidation({ type: 'query' })
export class QueryCategoryDto implements PaginateOptions {
    @Transform(({ value }) => toNumber(value))
    @IsNumber()
    @Min(1, {
        message: '页数最小为$constraint1',
    })
    @IsOptional()
    page = 1;

    @Transform(({ value }) => toNumber(value))
    @IsNumber()
    @Min(5, {
        message: '每页数量最小为$constraint1',
    })
    @IsOptional()
    limit = 5;
}

@CustomDtoValidation({ groups: ['create'] })
/**
 * 在某一分类下创建分类，不需要children
 */
export class CreateCategoryDto {
    @IsUniqueTree(CategoryEntity, {
        groups: ['create'],
        message: '分类名在同层分类中重复！',
    })
    @IsUniqueTreeUpdate(CategoryEntity, {
        groups: ['update'],
        message: '分类名在同层分类中重复！',
    })
    @MaxLength(30, {
        message: '分类最大长度为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '分类不能为空' })
    @IsOptional({ groups: ['update'] })
    content!: string;

    @IsExist(CategoryEntity, {
        always: true,
        message: '父分类不存在',
    })
    // parent要么是"null"，要么是uuid
    @IsUUID(undefined, {
        always: true,
        message: '父分类ID格式错误',
    })
    @ValidateIf((value) => value.parent && value.parent !== null)
    @IsOptional({
        always: true,
    })
    @Transform(({ value }) => (value === 'null' ? null : value))
    parent?: string;

    @Transform(({ value }) => toNumber(value))
    @IsNumber(undefined, {
        always: true,
    })
    @Min(0, {
        message: '排序值必须大于0',
        always: true,
    })
    @IsOptional({
        always: true,
    })
    customOrder = 0;
}

@CustomDtoValidation({ groups: ['update'] })
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @IsUUID(undefined, {
        groups: ['update'],
        message: '分类ID格式错误',
    })
    @IsNotEmpty({
        groups: ['update'],
        message: '分类ID不能为空',
    })
    id!: string;
}
