import { Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { RbacResolver } from "../rbac/rbac.resolver";
import { PermissionAction, SystemRoles } from "../rbac/constants";
import { CommentEntity, PostEntity } from "./entities";
import { addContentPermissions } from "./helpers";

/**
 * 模块启动时，添加权限与角色
 */
@Injectable()
export class ContentRbac implements OnModuleInit {
  constructor(protected moduleRef: ModuleRef) {}

  onModuleInit() {
    const resolver = this.moduleRef.get(RbacResolver, { strict: false });
    // 添加权限
    resolver.addPermissions([
      // 前台权限
      {
        name: "post.create",
        rule: {
          action: PermissionAction.CREATE,
          subject: PostEntity,
        },
        customOrder: 55
      },
      {
        name: "post.owner",
        rule: {
          action: PermissionAction.OWNER,
          subject: PostEntity,
          conditions: (user) => ({
            "author.id": user.id
          })
        },
        customOrder: 55,
      },
      {
        name: "comment.create",
        rule: {
          action: PermissionAction.CREATE,
          subject: CommentEntity
        },
        customOrder: 55
      },
      {
        name: "comment.owner",
        rule: {
          action: PermissionAction.OWNER,
          subject: CommentEntity,
          conditions: (user) => ({
            "author.id": user.id
          })
        },
        customOrder: 55,
      },
      // 后台权限：三个Entity的管理
      ...addContentPermissions()
    ]);

    resolver.addRoles([
      // 普通用户角色
      {
          name: SystemRoles.USER,
          permissions: [
              // 'post.read',
              'post.create',
              'post.owner',
              'comment.create',
              'comment.owner',
          ],
      }
    ]);

    // resolver.addMenus(
    //   addContentMenus()
    // )
  }
}