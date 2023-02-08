import { PaginateOptions } from "@/modules/utils";
import { CustomDtoValidation } from "@/modules/core/decorators";
import { IsOptional, IsNumber, Min, IsEnum } from "class-validator";
import { Transform } from "class-transformer";
import { toNumber } from "lodash";
import { TrashedDto } from "@/modules/core/types";
import { QueryTrashMode } from "@/modules/core/constants";

@CustomDtoValidation({ type: 'query' })
export class ListQueryDto implements PaginateOptions, TrashedDto {
    @IsEnum(QueryTrashMode)
    @IsOptional()
    trashed?: QueryTrashMode;

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
