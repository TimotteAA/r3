import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsUUID,
    MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { toBoolean } from '@/modules/core/helpers';
import { OrderField } from '@/modules/content/constants';
import { CustomDtoValidation } from "@/modules/database/decorators";
import { IsExist } from '@/modules/database/constraints';
import { CategoryEntity } from '../entities';
import { ListQueryDto } from '@/modules/restful/dto';
import { UserEntity } from '@/modules/user/entities';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { ManageCreatePostDto, ManageUpdatePostDto } from './manage/post.dto';

@CustomDtoValidation({ type: 'query' })
/**
 * 分页查询dto
 */
export class QueryPostDto extends ListQueryDto {
    @ApiPropertyOptional({
        description: "文章是否发布"
    })
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiPropertyOptional({
        description: "自定义排序",
        enum: OrderField
    })
    @IsEnum(OrderField, {
        message: `排序规则必须是${Object.values(OrderField).join(',')}其中一项`,
    })
    @IsOptional()
    customOrder?: OrderField;

    @ApiPropertyOptional({
        description: "分类ID，查询某个分类的文章"
    })
    @IsExist(CategoryEntity, {
        message: "分类不存在"
    })
    @IsUUID(undefined, {
        message: '分类ID格式错误',
    })
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({
        description: "全文搜索关键词",
        maxLength: 100
    })
    @MaxLength(100, {
        message: '搜索内容的最大长度为$constraint1'
    })
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({
        description: "作者ID，查询作者的文章",
    })
    @IsExist(UserEntity, {
        message: "作者不存在"
    })
    @IsUUID(undefined, {
        message: "作者ID格式错误"
    })
    @IsOptional()
    author?: string
}

@CustomDtoValidation({groups: ['create']})
export class CreatePostDto extends OmitType(ManageCreatePostDto, ['customOrder']) {}

@CustomDtoValidation({groups: ['update']})
export class UpdatePostDto extends OmitType(ManageUpdatePostDto, ['customOrder']) {}