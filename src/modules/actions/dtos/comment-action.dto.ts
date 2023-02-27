import { IsNotEmpty, IsUUID } from "class-validator";

import { BaseCreateActionDto } from "./base-action.dto";
import { IsExist } from "@/modules/database/constraints";
import { CommentEntity } from "@/modules/content/entities";
import { CustomDtoValidation } from "@/modules/database/decorators";

/**
 * 对评论点赞、讨厌
 */
@CustomDtoValidation()
export class CreateCommentActionDto extends BaseCreateActionDto {
    @IsExist(CommentEntity, {
        message: "评论不存在"
    })
    @IsUUID(undefined, {
        message: "评论ID格式错误"
    })
    @IsNotEmpty()
    comment!: string;
}