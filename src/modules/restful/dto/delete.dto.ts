import { Injectable } from '@nestjs/common';

import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsDefined, IsUUID } from 'class-validator';
import { toBoolean } from '@/modules/core/helpers';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Injectable()
export class DeleteDto {
    @ApiPropertyOptional({
        description: "是否软删除",
        default: false,
        type: Boolean
    })
    @IsBoolean()
    @Transform(({ value }) => toBoolean(value))
    @IsOptional()
    trashed?: boolean;

    @ApiProperty({
        description: "删除的数据id列表，支持批量删除",
        type: [String]
    })
    @IsUUID(undefined, {
        each: true,
        message: 'ID格式错误',
    })
    @IsDefined({
        each: true,
        message: 'ID必须指定',
    })
    ids: string[] = [];
}
