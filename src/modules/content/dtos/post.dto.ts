import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    IsNotEmpty,
    IsDateString,
    ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginateOptions } from '@/modules/utils';
import { isNil, toNumber } from 'lodash';
import { toBoolean } from '@/modules/core/helpers/index';
import { OrderField, PostBodyType } from '@/modules/content/constants';
import { PartialType } from '@nestjs/swagger';
import { CustomDtoValidation } from '@/modules/core/decorators';
import { IsExist } from '@/modules/database/constraints';
import { CategoryEntity } from '../entities';
import { TrashedDto } from '@/modules/core/types';
import { QueryTrashMode } from '@/modules/core/constants';

@CustomDtoValidation({ type: 'query' })
/**
 * 分页查询dto
 */
export class QueryPostDto implements PaginateOptions, TrashedDto {
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @IsEnum(OrderField, {
        message: `排序规则必须是${Object.values(OrderField).join(',')}其中一项`,
    })
    @IsOptional()
    customOrder?: OrderField;

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

    @IsUUID(undefined, {
        message: '分类ID格式错误',
    })
    @IsOptional()
    category?: string;

    @MaxLength(100, {
        message: '搜索内容的最大长度为$constraint1',
        always: true,
    })
    @IsOptional()
    search?: string;

    @IsEnum(QueryTrashMode)
    @IsOptional()
    trashed?: QueryTrashMode
}

@CustomDtoValidation({ groups: ['create'] })
/**
 * 创建文章的dto
 */
export class CreatePostDto {
    @MaxLength(50, {
        message: '文章标题最长为$constraint1',
        always: true,
    })
    @IsNotEmpty({ groups: ['create'], message: '文章标题不能为空' })
    @IsOptional({ groups: ['update'] })
    title!: string;

    @MaxLength(1000, {
        message: '文章内容最长为$constraint1',
        always: true,
    })
    @IsNotEmpty({ groups: ['create'], message: '文章内容不能为空' })
    @IsOptional({ groups: ['update'] })
    body!: string;

    @MaxLength(200, {
        message: '文章总结最长为$constraint1',
        always: true,
    })
    @IsOptional({ always: true })
    summary?: string;

    @IsExist(CategoryEntity, {
        each: true,
        always: true,
        message: '分类不存在',
    })
    @IsUUID(undefined, {
        each: true,
        message: '分类ID格式错误',
        always: true,
    })
    @IsOptional({ always: true })
    categories?: string[];

    @IsEnum(PostBodyType, {
        message: `排序规则必须是${Object.values(PostBodyType).join(',')}其中一项`,
        always: true,
    })
    @IsOptional({ always: true })
    type?: PostBodyType;

    @MaxLength(10, {
        each: true,
        message: '关键字最长10个字符',
        always: true,
    })
    @IsOptional({ always: true })
    keywords?: string[];

    @IsDateString(undefined, { always: true })
    @ValidateIf((object, value) => !isNil(value.publishedAt))
    @IsOptional({ always: true })
    @Transform(({ value }) => (value === 'null' ? null : value))
    publishedAt?: Date | null;

    @Transform(({ value }) => toNumber(value))
    @IsNumber(undefined, { always: true })
    @Min(0, {
        message: '自定义排序值最低为$constraint1',
    })
    @IsOptional({ always: true })
    customOrder: number = 0;
}

@CustomDtoValidation({ groups: ['update'] })
/**
 * 更新post的dto
 */
export class UpdatePostDto extends PartialType(CreatePostDto) {
    @IsUUID(undefined, { groups: ['update'], message: '$property必须是uuid格式' })
    @IsNotEmpty({ groups: ['update'] })
    id!: string;
}
