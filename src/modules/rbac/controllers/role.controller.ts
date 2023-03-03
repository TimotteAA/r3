import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Crud, Depends } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { PermissionAction } from "../constants";
import { RoleEntity } from "../entities";
import { RoleService } from "../services";
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto } from "../dtos";
import { PermissionChecker } from "../types";
import { simpleCrudOptions } from "../helpers";
import { RbacModule } from "../rbac.module";
import { ApiActionType } from "../constants";

const permissions: Record<ApiActionType, PermissionChecker[]> = {
  create: [async (ab) => ab.can(PermissionAction.CREATE, RoleEntity.name)],
  update: [async (ab) => ab.can(PermissionAction.UPDATE, RoleEntity.name)],
  delete: [async (ab) => ab.can(PermissionAction.DELETE, RoleEntity.name)],
  read_list: [async(ab) => ab.can(PermissionAction.READ_LIST, RoleEntity.name)],
  read_detail: [async (ab) => ab.can(PermissionAction.READ_DETAIL, RoleEntity.name)],
  restore: [async (ab) => ab.can(PermissionAction.RESTORE, RoleEntity.name)]
}

@ApiTags("角色管理")
@ApiBearerAuth()
@Depends(RbacModule)
@Crud(async () => ({
  id: "role",
  enabled: [
    { name: "create", options: simpleCrudOptions(permissions['create'], "创建角色") },
    { name: "list", options: simpleCrudOptions(permissions['read_list'], "分页查询角色") },
    { name: "update", options: simpleCrudOptions(permissions['update'], "更新指定角色") },
    { name: "delete", options: simpleCrudOptions(permissions['delete'], "删除角色，支持批量删除") },
    { name: "detail", options: simpleCrudOptions(permissions['read_detail'], "查看角色详情") },
    { name: "restore", options: simpleCrudOptions(permissions['restore'], "恢复软删除角色，支持批量恢复") }
  ],
  dtos: {
    query: QueryRoleDto,
    create: CreateRoleDto,
    update: UpdateRoleDto
  }
}))
@Controller("roles")
export class RoleController extends BaseController<RoleService> {
  constructor(
    protected roleService: RoleService
  ) {
    super(roleService)
  }
}