import { ConfigureRegister, ConfigureFactory } from "../core/types";
import { ContentConfig } from "./types";
import { CategoryEntity, PostEntity, CommentEntity } from "./entities";
import { PermissionAction } from "../rbac/constants";

export const createContentConfig: (
    register: ConfigureRegister<Partial<ContentConfig>>
) => ConfigureFactory<Partial<ContentConfig>, ContentConfig> = (register) => ({
    register,
    defaultRegister: configure => ({
        searchType: "against"
    })
})

export const addContentPermissions = () => ([
    {
        name: "content.post.manage",
        rule: {
            action: PermissionAction.MANAGE,
            subject: PostEntity
        },
        customOrder: 15,
    },
    {
        name: "content.category.manage",
        rule: {
            action: PermissionAction.MANAGE,
            subject: CategoryEntity
        },
        customOrder: 16,
    },
    {
        name: "content.comment.manage",
        rule: {
            action: PermissionAction.MANAGE,
            subject: CommentEntity
        },
        customOrder: 17,
    },
])
