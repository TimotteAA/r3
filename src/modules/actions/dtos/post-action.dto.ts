import { IsNotEmpty, IsUUID } from "class-validator";

import { BaseCreateActionDto } from "./base-action.dto";
import { IsExist } from "@/modules/database/constraints";
import { PostEntity } from "@/modules/content/entities";
import { CustomDtoValidation } from "@/modules/database/decorators";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 对文章点赞、讨厌
 */
@CustomDtoValidation()
export class CreatePostActionDto extends BaseCreateActionDto {
    @ApiProperty({
        description: "action作用的文章ID",
    })
    @IsExist(PostEntity, {
        message: "文章不存在"
    })
    @IsUUID(undefined, {
        message: "文章ID格式错误"
    })
    @IsNotEmpty()
    post!: string;
}