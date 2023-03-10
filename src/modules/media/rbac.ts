import { Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { RbacResolver } from "../rbac/rbac.resolver";
import { PermissionAction } from "../rbac/constants";
import { BannerEntity, AvatarEntity } from "./entities";


/**
 * 模块启动时，添加权限与角色
 */
@Injectable()
export class MediaRbac implements OnModuleInit {
  constructor(protected moduleRef: ModuleRef) {}

  onModuleInit() {
    const resolver = this.moduleRef.get(RbacResolver, { strict: false });
    // 添加权限
    resolver.addPermissions([
      {
        name: "banner.manage",
        rule: {
          action: PermissionAction.MANAGE,
          subject: BannerEntity,
        },
        customOrder: 45
      },
      {
        name: "avatar.manage",
        rule: {
          action: PermissionAction.MANAGE,
          subject: AvatarEntity,
        },
        customOrder: 46,
      }
    ]);
  }
}