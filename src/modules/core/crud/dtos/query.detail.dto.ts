import { Injectable } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { toBoolean } from '../../helpers';

@Injectable()
export class QueryDetailDto {
    @IsBoolean()
    @Transform(({ value }) => toBoolean(value))
    @IsOptional()
    trashed?: boolean;
}
