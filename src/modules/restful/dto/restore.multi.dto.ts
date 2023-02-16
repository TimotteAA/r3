import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';

/**
 * 批量恢复dto
 */
@Injectable()
export class RestoreDto {
    @ApiProperty({
        description: "恢复的数据ID列表，支持批量恢复",
        type: [Array]
    })
    @IsUUID(undefined, {
        each: true,
        message: 'ID格式不对',
    })
    @IsDefined({
        each: true,
        message: 'ID不能为空',
    })
    ids: string[] = [];
}
