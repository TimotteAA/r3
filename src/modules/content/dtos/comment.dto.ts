import { PaginateOptions } from '@/modules/utils';
import {
    IsNumber,
    Min,
    IsOptional,
    IsUUID,
    ValidateIf,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { toNumber } from 'lodash';
import { PickType } from '@nestjs/swagger';
import { CustomDtoValidation } from '@/modules/core/decorators';
import { IsExist } from '@/modules/database/constraints';
import { CommentEntity, PostEntity } from '../entities';

@CustomDtoValidation({ type: 'query' })
/**
 * 评论分页查询
 */
export class QueryCommentDto implements PaginateOptions {
    @IsExist(PostEntity, {
        groups: ['create'],
        message: '文章不存在',
    })
    @IsUUID(undefined, {
        message: '文章ID格式不对',
    })
    @ValidateIf((value) => value.post && value.post !== null)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value === 'null' ? null : value))
    post?: string;

    @Transform(({ value }) => toNumber(value))
    @IsNumber()
    @Min(1, {
        message: '页数最小为$constraint1',
    })
    @IsOptional()
    page = 1;

    @Transform(({ value }) => toNumber(value))
    @IsNumber()
    @Min(10, {
        message: '每页数量最小为$constraint1',
    })
    @IsOptional()
    limit = 10;
}

@CustomDtoValidation({ type: 'query' })
/**
 * 评论树查询
 */
export class QueryCommentTreeDto extends PickType(QueryCommentDto, ['post']) {}

@CustomDtoValidation({ groups: ['create'] })
/**
 * 创建评论
 */
export class CreateCommentDto {
    @MaxLength(200, {
        message: '评论内容长度不能超过200',
        groups: ['create'],
    })
    @IsNotEmpty({
        message: '评论内容不能为空',
        groups: ['create'],
    })
    content!: string;

    @IsExist(CommentEntity, {
        groups: ['create'],
        message: '父评论不存在',
    })
    @IsUUID(undefined, {
        message: '父评论ID格式不对',
    })
    @ValidateIf((value) => value.parent !== null && value.parent)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value === 'null' ? null : value))
    parent?: string;

    @IsExist(PostEntity, {
        groups: ['create'],
        message: '文章不存在',
    })
    @IsUUID(undefined, {
        groups: ['create'],
        message: '文章ID格式不对',
    })
    @IsNotEmpty({
        message: '文章ID不能为空',
        groups: ['create'],
    })
    post!: string;
}
