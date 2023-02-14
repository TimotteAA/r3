import { Crud } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { Controller } from "@nestjs/common";
import { PermissionAction } from "../constants";
import { RoleEntity } from "../entities";

import { RoleService } from "../services";
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto } from "../dtos";
import { PermissionChecker } from "../types";
import { simpleCrudOptions } from "../helpers";

// 角色管理员
const permissions: PermissionChecker[] = [
  async (ab) => {
    return ab.can(PermissionAction.MANAGE, RoleEntity.name)
  }
]

@Crud({
  id: "role",
  enabled: [
    { name: "create", options: simpleCrudOptions(permissions) },
    { name: "list", options: simpleCrudOptions(permissions) },
    { name: "update", options: simpleCrudOptions(permissions) },
    { name: "delete", options: simpleCrudOptions(permissions) },
    { name: "detail", options: simpleCrudOptions(permissions) },
    { name: "restore", options: simpleCrudOptions(permissions) }
  ],
  dtos: {
    query: QueryRoleDto,
    create: CreateRoleDto,
    update: UpdateRoleDto
  }
})
@Controller("roles")
export class RoleController extends BaseController<RoleService> {
  constructor(
    protected roleService: RoleService
  ) {
    super(roleService)
  }
}