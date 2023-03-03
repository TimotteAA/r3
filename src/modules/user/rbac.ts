import { Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import { RbacResolver } from "../rbac/rbac.resolver";
import { MenuType, PermissionAction, SystemRoles } from "../rbac/constants";
import { MessageEntity } from "./entities";
import { addUserPermissions } from "./helpers";
import { addRolePermissions } from "../rbac/helpers";

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
      // 用户、消息的权限
      ...addUserPermissions(),
      // 角色权限
      ...addRolePermissions(),

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

    resolver.addMenus([
      {
        name: "系统管理",
        path: "/system",
        type: MenuType.DIRECTORY,
        component: "Layout",
        children: [
          {
            name: "用户管理",
            path: "/system/user",
            type: MenuType.MENU,
            component: "/views/system/user/index.vue",
            children: [
              {
                name: "创建用户",
                type: MenuType.PERMISSION,
                permission: "system.user.create"
              },  
              {
                name: "更新用户",
                type: MenuType.PERMISSION,
                permission: "system.user.update"
              },             
              {
                name: "删除用户",
                type: MenuType.PERMISSION,
                permission: "system.user.delete"
              },     
              {
                name: "恢复用户",
                type: MenuType.PERMISSION,
                permission: "system.user.restore"
              },          
              {
                name: "分页查询用户",
                type: MenuType.PERMISSION,
                permission: "system.user.read_list"
              },        
              {
                name: "用户详情",
                type: MenuType.PERMISSION,
                permission: "system.user.read_detail"
              }
            ]
          },
          {
            name: "站内信管理",
            path: "/system/message",
            type: MenuType.MENU,
            component: "/views/system/message/index.vue",
            children: [
              {
                name: "删除消息",
                type: MenuType.PERMISSION,
                permission: "system.message.delete"
              },            
              {
                name: "分页查询消息",
                type: MenuType.PERMISSION,
                permission: "system.message.read_list"
              },   
            ]
          },
          {
            name: "角色管理",
            path: "/system/role",
            type: MenuType.MENU,
            component: "/views/system/role/index.vue",
            children: [
              {
                name: "创建角色",
                type: MenuType.PERMISSION,
                permission: "system.role.create"
              },  
              {
                name: "更新角色",
                type: MenuType.PERMISSION,
                permission: "system.role.update"
              },             
              {
                name: "删除角色",
                type: MenuType.PERMISSION,
                permission: "system.role.delete"
              },     
              {
                name: "恢复角色",
                type: MenuType.PERMISSION,
                permission: "system.role.restore"
              },          
              {
                name: "分页查询角色",
                type: MenuType.PERMISSION,
                permission: "system.role.read_list"
              },        
              {
                name: "角色详情",
                type: MenuType.PERMISSION,
                permission: "system.role.read_detail"
              }
            ]
          },
          {
            name: "权限管理",
            path: "/system/permission",
            type: MenuType.MENU,
            component: "/views/system/permission/index.vue",
            children: [        
              {
                name: "分页查询权限",
                type: MenuType.PERMISSION,
                permission: "system.permission.read_list"
              },        
              {
                name: "权限详情",
                type: MenuType.PERMISSION,
                permission: "system.permission.read_detail"
              }
            ]
          }
        ]
      }
    ])
  }
}