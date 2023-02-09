import { Controller,  } from "@nestjs/common";

import { Crud } from "@/modules/core/decorators";
import { PermissionChecker } from "../types";
import { PermissionAction } from "../constants";
import { PermissionEntity } from "../entities";
import { QueryPermissionDto } from "../dtos";
import { BaseController } from "@/modules/core/crud";
import { PermissionService } from "../services";
import { simpleCrudOptions } from "../helpers";

/**
 * 权限：权限管理员
 */
const permissions: PermissionChecker[] = [async (ablitiy) => {
  return ablitiy.can(PermissionAction.MANAGE, PermissionEntity.name)
}]

@Crud({
  id: "permission",
  enabled: [
    { name: "list", options: simpleCrudOptions(permissions)},
    { name: "detail", options: simpleCrudOptions(permissions) }
  ],
  dtos: {
    query: QueryPermissionDto
  }
})
@Controller("permissions")
export class PermissionController extends BaseController<PermissionService> { 
  constructor(
    protected permissionService: PermissionService
  ) {
    super(permissionService);
  }
  
  // @Get()
  // async list(@Query() data: QueryPermissionDto) {
  //   return this.permissionService.pa(data);
  // }

  // @Get(":id")
  // async detail(@Query("id") id: string) {
  //   return this.permissionService.detail(id);
  // }
}