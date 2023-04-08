import { Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import { PermissionAction, SystemRoles } from "../rbac/constants";
import { RbacResolver } from "../rbac/rbac.resolver";
import { ActionEntity } from "./entities";
import { addActionPermissions } from "./helpers";

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
                },
                customOrder: 100,
            },
            {
                name: "comment.action",
                rule: {
                    action: PermissionAction.CREATE,
                    subject: ActionEntity.name
                },
                customOrder: 100,
            },
            // 后台权限
            ...addActionPermissions()
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
        ])

        // resolver.addMenus(addActionMenus())
    }
}