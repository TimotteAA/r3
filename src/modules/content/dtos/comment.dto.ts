import {
    IsOptional,
    IsUUID,
    ValidateIf,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { OmitType, PickType } from '@nestjs/swagger';
import { CustomDtoValidation } from "@/modules/database/decorators";
import { IsExist } from '@/modules/database/constraints';
import { CommentEntity, PostEntity } from '../entities';
import { ManageCommentQuery } from './manage';

@CustomDtoValidation({ type: 'query' })
/**
 * 评论分页查询
 */
export class QueryCommentDto extends OmitType(ManageCommentQuery, ['trashed']) {}

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
