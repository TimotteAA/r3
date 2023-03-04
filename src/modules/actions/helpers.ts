import { PermissionAction, MenuType } from "../rbac/constants";
import { ActionEntity } from "./entities";

export const addActionPermissions = () => ([
    {
        name: "action.stuff.read_list",
        rule: {
            action: PermissionAction.READ_LIST,
            subject: ActionEntity
        },
        customOrder: 13,
    },
])

export const addActionMenus = () => ([
    {
        name: "action管理",
        path: "/action",
        type: MenuType.DIRECTORY,
        component: "Layout",
        children: [
            {
                name: "点赞管理",
                path: "/action/thumbs-up",
                type: MenuType.DIRECTORY,
                component: "/views/action/thumbs/index.vue",
                children: [
                    {
                        name: "创建用户",
                        type: MenuType.PERMISSION,
                        permission: "action.stuff.read_list"
                    }, 
                ]
            }
        ]
    }
])