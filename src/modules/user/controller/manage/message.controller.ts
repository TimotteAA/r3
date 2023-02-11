import { BaseController } from "@/modules/core/crud";
import { Crud } from "@/modules/core/decorators";
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

@Crud({
  id: "message",
  enabled: [
    { name: "list", options: simpleCrudOptions(permissions) },
    { name: "delete", options: simpleCrudOptions(permissions) }
  ],
  dtos: {
    query: ListQueryDto
  }
})
@Controller("messages")
export class MessageController extends BaseController<MessageService> {
  constructor(protected messageService: MessageService) {
    super(messageService)
  }
}