import {
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
import { isNil, toNumber } from 'lodash';
import {  PostBodyType } from '@/modules/content/constants';
import { PartialType } from '@nestjs/swagger';
import { CustomDtoValidation } from '@/modules/core/decorators';
import { IsExist } from '@/modules/database/constraints';
import { CategoryEntity } from '../../entities';

@CustomDtoValidation({ groups: ['create'] })
/**
 * 创建文章的dto
 */
export class ManageCreatePostDto {
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
export class ManageUpdatePostDto extends PartialType(ManageCreatePostDto) {
    @IsUUID(undefined, { groups: ['update'], message: '$property必须是uuid格式' })
    @IsNotEmpty({ groups: ['update'] })
    id!: string;
}
