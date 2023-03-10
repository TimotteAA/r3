import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { BaseController } from "@/modules/restful/controller";
import { Crud } from "@/modules/restful/decorators";
import { AvatarService } from "../../service";
import { Depends } from "@/modules/restful/decorators";
import { MediaModule } from "../../media.module";
import { CoreModule } from "@/modules/core/core.module";
import { TecentOsModule } from "@/modules/tencent-os/tecent-os.module";
import { simpleCrudOptions } from "@/modules/rbac/helpers";
import { ListQueryDto } from "@/modules/restful/dto";
import { PermissionChecker } from "@/modules/rbac/types";
import { PermissionAction } from "@/modules/rbac/constants";
import { AvatarEntity } from "../../entities";


const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, AvatarEntity.name)
]

@ApiTags("文件管理-用户头像管理")
@Depends(MediaModule, CoreModule, TecentOsModule)
@Crud(async () => ({
    id: "avatar",
    enabled: [
        { name: "detail", options: simpleCrudOptions(permissions, "查看指定头像详情") },
        { name: "list", options: simpleCrudOptions(permissions, "分页查询头像") },
        { name: "delete", options: simpleCrudOptions(permissions, "删除头像，支持批量删除") }
    ],
    dtos: {
        query: ListQueryDto
    }
}))
@Controller("avatars")
export class AvatarController extends BaseController<AvatarService> {
    constructor(protected service: AvatarService,
    ) {
        super(service)
    }
}