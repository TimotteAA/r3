import { simpleCrudOptions } from "@/modules/rbac/helpers";
import { BaseController } from "@/modules/restful/controller";
import { ApiTags } from "@nestjs/swagger";

import { Crud } from "@/modules/restful/decorators";
import { QueryActionDto } from "../../dtos/manage";
import { ActionRepository } from "../../repositorys";
import { ActionService } from "../../services";
import { Depends } from "@/modules/restful/decorators";
import { ActionModule } from "../../action.module";
import { Controller } from "@nestjs/common";
import { ContentModule } from "@/modules/content/content.module";
import { UserModule } from "@/modules/user/user.module";
import { PermissionChecker } from "@/modules/rbac/types";
import { PermissionAction } from "@/modules/rbac/constants";
import { ActionEntity } from "../../entities";

const permission: PermissionChecker = async (ab) =>
    ab.can(PermissionAction.MANAGE, ActionEntity.name)

@ApiTags("action管理")
@Depends(ActionModule, ContentModule, UserModule)
@Crud(async () => ({
    id: "action",
    enabled: [
        { name: "list", options: simpleCrudOptions([permission], "action分页") },
        { name: "delete",  opionts: simpleCrudOptions([permission], '删除action，支持批量删除')}
    ],
    dtos: {
        query: QueryActionDto
    }
}))
@Controller("actions")
export class ActionController extends BaseController<ActionService, ActionRepository> {
    constructor(
        protected actionService: ActionService,
        protected actionRepo: ActionRepository,
    ) {
        super(actionService)
    }
}