import { PermissionAction } from "../rbac/constants";
import { ActionEntity } from "./entities";

export const addActionPermissions = () => ([
    {
        name: "action.manage",
        rule: {
            action: PermissionAction.MANAGE,
            subject: ActionEntity
        },
        customOrder: 33,
    },
])

