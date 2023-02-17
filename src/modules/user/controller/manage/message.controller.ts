import { Crud } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { PermissionAction } from "@/modules/rbac/constants";
import { simpleCrudOptions } from "@/modules/rbac/helpers";
import { PermissionChecker } from "@/modules/rbac/types";
import { ListQueryDto } from "@/modules/restful/dto";
import { Controller } from "@nestjs/common";
import { MessageEntity } from "../../entities";
import { MessageService } from "../../services";

const permissions: PermissionChecker[] = [
  async (ab) => ab.can(PermissionAction.MANAGE, MessageEntity.name)
]

@Crud(async () => ({
  id: "message",
  enabled: [
    { name: "list", options: simpleCrudOptions(permissions, { summary: "消息列表" }) },
    { name: "delete", options: simpleCrudOptions(permissions, { summary: "删除消息，支持批量删除" }) }
  ],
  dtos: {
    query: ListQueryDto
  }
}))
@Controller("messages")
export class MessageController extends BaseController<MessageService> {
  constructor(protected messageService: MessageService) {
    super(messageService)
  }
}