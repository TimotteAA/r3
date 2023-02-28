import { Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import { PermissionAction, SystemRoles } from "../rbac/constants";
import { RbacResolver } from "../rbac/rbac.resolver";
import { ActionEntity } from "./entities";

@Injectable()
export class ActionRbac implements OnModuleInit {
    constructor(protected moduleRef: ModuleRef) {}

    async onModuleInit() {
        const resolver = this.moduleRef.get(RbacResolver, { strict: false });

        // 添加权限、普通用户操作的权限
        resolver.addPermissions([
            // 文章操作
            {
                name: "post.action",
                rule: {
                    action: PermissionAction.CREATE,
                    subject: ActionEntity.name
                }
            },
            {
                name: "comment.action",
                rule: {
                    action: PermissionAction.CREATE,
                    subject: ActionEntity.name
                }
            },
            // 后台权限
            {
                name: "action.manage",
                rule: {
                    action: PermissionAction.MANAGE,
                    subject: ActionEntity.name
                }
            }
        ])

        // 添加角色
        resolver.addRoles([
            // 普通用户
            {
                name: SystemRoles.USER,
                label: "系统默认角色",
                description: "系统默认角色",
                permissions: ["post.action", "comment.action"]
            },
            {
                name: "action-manage",
                label: "action模块管理",
                description: "后台管理action",
                permissions: ['action.manage']
            }
        ])
    }
}