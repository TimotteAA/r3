import { Injectable } from "@nestjs/common";
import { IsDefined, IsNotEmpty, IsOptional, IsUUID, Min, IsNumber, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";
import { toNumber } from "lodash";
import { toBoolean } from "@/modules/core/helpers/index";
import { CustomDtoValidation } from "@/modules/core/decorators";
import { IsExist } from "@/modules/database/constraints";
import { MessageEntity, UserEntity } from "../entities";
import { PaginateOptions } from "@/modules/utils";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * 连接dto
 */
@Injectable()
export class WSAuthDto {
  @IsNotEmpty({
    message: "token不能为空"
  })
  token!: string;
}

/**
 * 发送消息dto
 */
@Injectable()
export class WsMessageDto extends WSAuthDto {
  @IsOptional()
  title?: string;

  @IsNotEmpty({
    message: "消息内容不能为空"
  })
  body!: string

  // 发送者可以从token中获得
  // @IsNotEmpty({message: "FASHON"})
  // sender!: string;
  
  @IsUUID(undefined, {
    each: true,
    message: "ID格式错误"
  })
  @IsNotEmpty({message: "接收者不能为空", each: true})
  receivers: string[]

  @IsOptional()
  type?: string
}

/**
 * 接收者更新消息状态
 * 走post方法，需要dto装饰器
 */
@Injectable()
@CustomDtoValidation({type: "body"})
export class UpdateReceviesDto {
  @ApiProperty({
    description: "消息ID数组",
    type: [String]
  })
  @IsExist(MessageEntity, {
    each: true,
    message: "消息不存在"
  })
  @IsUUID(undefined, {
    each: true,
    message: "消息ID格式不正确"
  })
  @IsDefined({message: "消息列表不能为空"})
  receives: string[];
}

// 后面的是消息相关的crud

/**
 * 分页查询消息
 */
@Injectable()
@CustomDtoValidation({
    type: 'query',
    skipMissingProperties: true,
})
export class QueryOwnerMessageDto implements PaginateOptions {
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    page = 1;

    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '每页显示数据必须大于1' })
    @IsNumber()
    @IsOptional()
    limit = 10;
}

/**
 * 消息管理查询请求验证
 * 查询发送者的消息
 */
@Injectable()
@CustomDtoValidation({
    type: 'query',
    skipMissingProperties: true,
})
export class QueryMessageDto extends QueryOwnerMessageDto {
    @ApiPropertyOptional({
      description: "发送者ID"
    })
    @IsExist(UserEntity, {
        message: '发送者不存在',
    })
    @IsUUID(undefined, { message: '发送者ID格式错误' })
    @IsOptional()
    sender?: string;
}

/**
 * 收到的消息查询请求验证
 */
@Injectable()
@CustomDtoValidation({
    type: 'query',
    skipMissingProperties: true,
})
export class QueryReciveMessageDto extends QueryOwnerMessageDto {
    /**
     * @description 过滤已读状态
     * @type {boolean}
     */
    @ApiPropertyOptional({
      description: "消息是否已读",
      type: Boolean
    })
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    readed?: boolean;
}
