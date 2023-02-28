import { ApiPropertyOptional, OmitType } from "@nestjs/swagger";

import { CustomDtoValidation } from "@/modules/database/decorators";
import { ListQueryDto } from "@/modules/restful/dto";
import { TypeStuff, TypeAction } from "../../constants";
import { IsEnum, IsOptional } from "class-validator";

@CustomDtoValidation({type: "query"})
export class QueryActionDto extends OmitType(ListQueryDto, ['trashed']) {
    @ApiPropertyOptional({
        description: "查询文章或评论的操作",
        enum: TypeStuff
    })
    @IsEnum(TypeStuff, {
        message: `stuffType必须是${Object.values(TypeStuff).join(",")}中的一个`
    })
    @IsOptional()
    stuffType?: TypeStuff

    @ApiPropertyOptional({
        description: "查询点赞或不喜欢",
        enum: TypeAction
    })
    @IsEnum(TypeAction, {
        message: `action必须是${Object.values(TypeAction).join(",")}中的一个`
    })
    @IsOptional()
    action?: TypeAction
}