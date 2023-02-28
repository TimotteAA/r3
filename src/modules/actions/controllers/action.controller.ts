import { ContentModule } from "@/modules/content/content.module";
import { Depends } from "@/modules/restful/decorators";
import { UserModule } from "@/modules/user/user.module";
import { Body, Controller, Post, SerializeOptions } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CreateCommentActionDto, CreatePostActionDto } from "../dtos";
import { ActionService } from "../services";
import { User } from "@/modules/user/decorators";
import { UserEntity } from "@/modules/user/entities";
import { ActionModule } from "../action.module";
import { PermissionChecker } from "@/modules/rbac/types";
import { PermissionAction } from "@/modules/rbac/constants";
import { ActionEntity } from "../entities";
import { Permission } from "@/modules/rbac/decorators";

const permission: PermissionChecker = async (ab) =>
    ab.can(PermissionAction.CREATE, ActionEntity.name)

@ApiTags("action操作")
@Depends(ContentModule, UserModule, ActionModule)
@Controller("actions")
export class ActionController {
    constructor(protected service: ActionService) {
    }
    
    @ApiOperation({
        summary: "对某篇文章的action"
    })
    @ApiBearerAuth()
    @Post("posts")
    @SerializeOptions({groups: ['post-detail']})
    @Permission(permission)
    async actionPost(
        @Body()
        data: CreatePostActionDto,
        @User() user: ClassToPlain<UserEntity>
    ) {

        return this.service.actionPost(data, user.id)
    }

    @ApiOperation({
        summary: "对某条评论的action"
    })
    @ApiBearerAuth()
    @Post("comments")
    @Permission(permission)
    async actionComment(
        @Body()
        data: CreateCommentActionDto,
        @User() user: ClassToPlain<UserEntity>
    ) {
        return this.service.actionComment(data, user.id);
    }
}