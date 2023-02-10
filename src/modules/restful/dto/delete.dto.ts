import { Injectable } from '@nestjs/common';

import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsDefined, IsUUID } from 'class-validator';
import { toBoolean } from '@/modules/core/helpers/index';

@Injectable()
export class DeleteDto {
    @IsBoolean()
    @Transform(({ value }) => toBoolean(value))
    @IsOptional()
    trashed?: boolean;

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
