import {
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { IsExist } from '@/modules/database/constraints';
import { PostEntity } from '../../entities';
import { CustomDtoValidation } from "@/modules/core/decorators";
import { ListQueryDto } from "@/modules/restful/dto";
import { UserEntity } from "@/modules/user/entities";
import { ApiPropertyOptional } from '@nestjs/swagger';

@CustomDtoValidation({type: "query"})
export class ManageCommentQuery extends ListQueryDto {
  @ApiPropertyOptional({
    description: "查询某个用户的评论"
  })
  @IsExist(UserEntity, {
    message: '用户不存在',
  })
  @IsUUID(undefined, {
      message: '用户ID格式不对',
  })
  @ValidateIf((value) => value.post && value.post !== null)
  @IsOptional({ always: true })
  @Transform(({ value }) => (value === 'null' ? null : value))
  author?: string;

  @ApiPropertyOptional({
    description: "查询某篇文章的评论"
  })
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
}