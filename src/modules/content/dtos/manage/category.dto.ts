import { Transform } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf
} from 'class-validator';
import { toNumber } from 'lodash';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CustomDtoValidation } from '@/modules/core/decorators';
import { IsExist, IsUniqueTree, IsUniqueTreeUpdate } from '@/modules/database/constraints';
import { CategoryEntity, PostEntity } from '../../entities';

/**
 * 查询某篇文章的分类
 */
@CustomDtoValidation({ type: 'query' })
export class QueryCategoryDto {
    @ApiPropertyOptional({
        description: "查询某篇文章的分类"
    })
    @IsExist(PostEntity, {
        message: "文章不存在",
        each: true,
        always: true
    })
    @IsUUID(undefined, {
        message: "文章ID格式错误",
        each: true,
        always: true
    })
    @IsOptional({always: true})
    post?: string[]
}

@CustomDtoValidation({ groups: ['create'] })
/**
 * 在某一分类下创建分类，不需要children
 */
export class CreateCategoryDto {
    @ApiProperty({
        description: "分类名称，在分类树的同层中必须唯一",
        uniqueItems: true,
        maxLength: 30
    })
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

    @ApiPropertyOptional({
        description: "可选的父分类ID"
    })
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

    @ApiPropertyOptional({
        description: "可选的自定义排序：该排序仅生效于获取树形分类，且仅作用于同一父类下的同级别的子分类",
        default: 0,
        minimum: 0,
        type: Number
    })
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
    @ApiProperty({
        description: "更新的分类ID"
    })
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
