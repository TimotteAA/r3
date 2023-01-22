import { Injectable } from '@nestjs/common';
import { IsDefined, IsUUID } from 'class-validator';
import { DeleteDto } from './delete.dto';

@Injectable()
export class DeleteMultiDto extends DeleteDto {
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
