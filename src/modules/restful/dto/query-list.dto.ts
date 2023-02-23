import { PaginateOptions } from "@/modules/database/types";
import { CustomDtoValidation } from "@/modules/database/decorators";
import { IsOptional, IsNumber, Min, IsEnum } from "class-validator";
import { Transform } from "class-transformer";
import { toNumber } from "lodash";
import { TrashedDto } from "@/modules/database/types";
import { QueryTrashMode } from "@/modules/database/constants";
import { ApiPropertyOptional } from "@nestjs/swagger";

@CustomDtoValidation({ type: 'query' })
export class ListQueryDto implements PaginateOptions, TrashedDto {
    @ApiPropertyOptional({
        description: "查询软删除类型",
        enum: QueryTrashMode
    })
    @IsEnum(QueryTrashMode)
    @IsOptional()
    trashed?: QueryTrashMode;

    @ApiPropertyOptional({
        description: "分页查询页数",
        default: 1,
        type: Number,
        minimum: 1
    })
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    page = 1;

    @ApiPropertyOptional({
        description: "每页查询数量",
        default: 5,
        minimum: 5,
        type: Number
    })
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '每页显示数据必须大于1' })
    @IsNumber()
    @IsOptional()
    limit = 5;
}
