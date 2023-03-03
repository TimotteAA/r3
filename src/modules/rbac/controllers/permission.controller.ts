import { Controller,  } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Crud, Depends } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { PermissionChecker } from "../types";
import { PermissionAction } from "../constants";
import { PermissionEntity } from "../entities";
import { QueryPermissionDto } from "../dtos";
import { PermissionService } from "../services";
import { simpleCrudOptions } from "../helpers";
import { RbacModule } from "../rbac.module";

/**
 * 权限：权限管理员
 */
const permissions: Record<"read_list" | "read_detail", PermissionChecker[]> = {
  read_list: [async(ab) => ab.can(PermissionAction.READ_LIST, PermissionEntity.name)],
  read_detail: [async (ab) => ab.can(PermissionAction.READ_DETAIL, PermissionEntity.name)],
}

@ApiTags("权限管理")
@ApiBearerAuth()
@Depends(RbacModule)
@Crud(async () => ({
  id: "permission",
  enabled: [
    { name: "list", options: simpleCrudOptions(permissions['read_list'], "分页查询权限")},
    { name: "detail", options: simpleCrudOptions(permissions['read_detail'], "查看权限详情") }
  ],
  dtos: {
    query: QueryPermissionDto
  }
}))
// @Crud({
//   id: "permission",
//   enabled: [
//     { name: "list", options: simpleCrudOptions(permissions, { description: "分页查询权限" })},
//     { name: "detail", options: simpleCrudOptions(permissions, { description: "查看权限详情" }) }
//   ],
//   dtos: {
//     query: QueryPermissionDto
//   }
// })
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