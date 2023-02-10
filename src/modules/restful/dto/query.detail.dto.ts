import { Injectable } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { toBoolean } from '@/modules/core/helpers/index';

@Injectable()
export class QueryDetailDto {
    @IsBoolean()
    @Transform(({ value }) => toBoolean(value))
    @IsOptional()
    trashed?: boolean;
}
