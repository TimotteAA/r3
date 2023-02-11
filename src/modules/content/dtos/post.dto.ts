import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsUUID,
    MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { toBoolean } from '@/modules/core/helpers/index';
import { OrderField } from '@/modules/content/constants';
import { CustomDtoValidation } from '@/modules/core/decorators';
import { IsExist } from '@/modules/database/constraints';
import { CategoryEntity } from '../entities';
import { ListQueryDto } from '@/modules/restful/dto';
import { UserEntity } from '@/modules/user/entities';
import { OmitType } from '@nestjs/swagger';
import { ManageCreatePostDto, ManageUpdatePostDto } from './manage/post.dto';

@CustomDtoValidation({ type: 'query' })
/**
 * 分页查询dto
 */
export class QueryPostDto extends ListQueryDto {
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @IsEnum(OrderField, {
        message: `排序规则必须是${Object.values(OrderField).join(',')}其中一项`,
    })
    @IsOptional()
    customOrder?: OrderField;

    @IsExist(CategoryEntity, {
        message: "分类不存在"
    })
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