import { IsDefined, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { TypeAction, TypeStuff } from "../constants";

export class BaseCreateActionDto {
    @ApiProperty({
        description: "对stuff的行为",
        enum: TypeAction
    })
    @IsEnum(TypeAction, {
        message: `actionType必须是${Object.values(TypeAction).join(",")}中的一个`
    })
    @IsDefined()
    actionType!: TypeAction;

    @ApiProperty({
        description: "作用的stuff类型",
        enum: TypeStuff
    })
    @IsEnum(TypeStuff, {
        message: `actionStuff必须是${Object.values(TypeStuff).join(",")}中的一个`
    })
    @IsDefined()
    actionStuff!: TypeStuff;
}