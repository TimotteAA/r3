import { Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { RbacResolver } from "../rbac/rbac.resolver";
import { PermissionAction } from "../rbac/constants";
import { UserEntity } from "./entities";

/**
 * 模块启动时，添加权限与角色
 */
@Injectable()
export class UserRbac implements OnModuleInit {
  constructor(protected moduleRef: ModuleRef) {}

  onModuleInit() {
    const resolver = this.moduleRef.get(RbacResolver, { strict: false });
    // 添加权限
    resolver.addPermissions([
      // 后台权限
      {
        name: "user.manage",
        rule: {
          action: PermissionAction.MANAGE,
          subject: UserEntity,
        }
      }
    ]);

    resolver.addRoles([
      {
          name: 'user-manage',
          label: '用户管理员',
          description: '管理用户',
          permissions: ['user.manage'],
      },
  ]);
  }
}