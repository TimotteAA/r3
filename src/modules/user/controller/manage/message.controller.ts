import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Crud, Depends } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { PermissionAction } from "@/modules/rbac/constants";
import { simpleCrudOptions } from "@/modules/rbac/helpers";
import { PermissionChecker } from "@/modules/rbac/types";
import { ListQueryDto } from "@/modules/restful/dto";
import { MessageEntity } from "../../entities";
import { MessageService } from "../../services";
import { UserModule } from "../../user.module";

// const permissions: PermissionChecker[] = [
//   async (ab) => ab.can(PermissionAction.MANAGE, MessageEntity.name)
// ]

const permissions: Record<'delete' | 'read_list', PermissionChecker[]> = {
  delete: [async (ab) => ab.can(PermissionAction.DELETE, MessageEntity.name)],
  read_list: [async(ab) => ab.can(PermissionAction.READ_LIST, MessageEntity.name)],
}


@ApiTags("消息管理")
@ApiBearerAuth()
@Depends(UserModule)
@Crud(async () => ({
  id: "message",
  enabled: [
    { name: "list", options: simpleCrudOptions(permissions['read_list'], "消息列表") },
    { name: "delete", options: simpleCrudOptions(permissions['delete'], "删除消息，支持批量删除") }
  ],
  dtos: {
    query: ListQueryDto
  }
}))
// @Crud({
//   id: "message",
//   enabled: [
//     { name: "list", options: simpleCrudOptions(permissions, { summary: "消息列表" }) },
//     { name: "delete", options: simpleCrudOptions(permissions, { summary: "删除消息，支持批量删除" }) }
//   ],
//   dtos: {
//     query: ListQueryDto
//   }
// })
@Controller("messages")
export class MessageController extends BaseController<MessageService> {
  constructor(protected messageService: MessageService) {
    super(messageService)
  }
}