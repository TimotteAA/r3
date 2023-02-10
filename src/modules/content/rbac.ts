import { Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { RbacResolver } from "../rbac/rbac.resolver";
import { PermissionAction, SystemRoles } from "../rbac/constants";
import { CategoryEntity, CommentEntity, PostEntity } from "./entities";

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
      {
        name: "post.create",
        rule: {
          action: PermissionAction.CREATE,
          subject: PostEntity,
        }
      },
      {
        name: "post.owner",
        rule: {
          action: PermissionAction.OWNER,
          subject: PostEntity,
          conditions: (user) => ({
            "author.id": user.id
          })
        }
      },
      {
        name: "comment.create",
        rule: {
          action: PermissionAction.CREATE,
          subject: CommentEntity
        }
      },
      {
        name: "comment.owner",
        rule: {
          action: PermissionAction.OWNER,
          subject: CommentEntity,
          conditions: (user) => ({
            "author.id": user.id
          })
        }
      },
      // 后台权限
      {
        name: "post.manage",
        rule: {
          action: PermissionAction.MANAGE,
          subject: PostEntity
        }
      },
      {
        name: "comment.manage",
        rule: {
          action: PermissionAction.MANAGE,
          subject: CommentEntity
        }
      },
      {
        name: "category.manage",
        rule: {
          action: PermissionAction.MANAGE,
          subject: CategoryEntity
        }
      }
    ]);

    resolver.addRoles([
      {
          name: SystemRoles.USER,
          permissions: [
              'post.read',
              'post.create',
              'post.owner',
              'comment.create',
              'comment.owner',
          ],
      },
      {
          name: 'content-manage',
          label: '内容管理员',
          description: '管理内容模块',
          permissions: ['post.manage', 'category.manage', 'comment.manage'],
      },
  ]);
  }
}