import { Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import { RbacResolver } from "../rbac/rbac.resolver";
import { PermissionAction, SystemRoles } from "../rbac/constants";
import { MessageEntity, UserEntity } from "./entities";


/**
 * 模块启动时，添加权限与角色
 */
@Injectable()
export class UserRbac implements OnModuleInit {
  constructor(protected moduleRef: ModuleRef, 
  ) {}

  async onModuleInit() {
    const resolver = this.moduleRef.get(RbacResolver, { strict: false });
    // 添加权限
    resolver.addPermissions([
      // 后台权限，主要是利用casl的rule对象
      // // 直接一个manage管死
      // {
      //   name: "system.user.manage",
      //   rule: {
      //     action: PermissionAction.MANAGE,
      //     subject: UserEntity,
      //   },
      // },
      // CRUD按钮权限
      {
        name: "system.user.create",
        rule: {
          action: PermissionAction.CREATE,
          subject: UserEntity
        }
      },
      {
        name: "system.user.update",
        rule: {
          action: PermissionAction.UPDATE,
          subject: UserEntity
        }
      },
      {
        name: "system.user.delete",
        rule: {
          action: PermissionAction.DELETE,
          subject: UserEntity
        }
      },
      {
        name: "system.user.restore",
        rule: {
          action: PermissionAction.RESTORE,
          subject: UserEntity
        }
      },
      {
        name: "system.user.read_detail",
        rule: {
          action: PermissionAction.READ_DETAIL,
          subject: UserEntity
        }
      },
      {
        name: "system.user.read_list",
        rule: {
          action: PermissionAction.READ_LIST,
          subject: UserEntity
        }
      },
      // 前台权限
      {
        name: "message.create",
        rule: {
          action: PermissionAction.CREATE,
          subject: MessageEntity
        }
      },
      {
        name: "message.sended-message",
        rule: {
          action: "sended-message",
          subject: MessageEntity,
          conditions: (user) => ({
            "sender.id": user.id
          })
        }
      },
      {
        name: "message.recevied-message",
        rule: {
          action: "recevied-message",
          subject: MessageEntity,
          conditions: (user) => ({
            "receives.receiver.id": user.id
          })
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
      {
        name: SystemRoles.USER,
        label: "系统默认角色",
        description: "系统默认角色",
        permissions: ['message.create', 'message.sended-message', 'message.recevied-message']
      }
    ]);

  }
}