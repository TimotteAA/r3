import { Injectable } from '@nestjs/common';
import { IsDefined, IsUUID } from 'class-validator';

@Injectable()
export class RestoreMultiDto {
    @IsUUID(undefined, {
        each: true,
        message: 'ID格式不对',
    })
    @IsDefined({
        each: true,
        message: 'ID不能为空',
    })
    ids: string[];
}
