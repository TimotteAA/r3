import { ConfigureRegister, ConfigureFactory } from "../core/types";
import { ContentConfig } from "./types";
import { CategoryEntity, PostEntity, CommentEntity } from "./entities";
import { PermissionAction } from "../rbac/constants";
import { MenuType } from "../rbac/constants";

export const createContentConfig: (
    register: ConfigureRegister<Partial<ContentConfig>>
) => ConfigureFactory<Partial<ContentConfig>, ContentConfig> = (register) => ({
    register,
    defaultRegister: configure => ({
        searchType: "against"
    })
})

export const addContentPermissions = () => ([
    // 文章的CRUD
    {
        name: "content.post.create",
        rule: {
            action: PermissionAction.CREATE,
            subject: PostEntity
        },
        customOrder: 6,
    },
    {
        name: "content.post.update",
        rule: {
            action: PermissionAction.UPDATE,
            subject: PostEntity
        },
        customOrder: 6,   
    },
    {
        name: "content.post.delete",
        rule: {
            action: PermissionAction.DELETE,
            subject: PostEntity
        },
        customOrder: 6,
    },
    {
        name: "content.post.restore",
        rule: {
            action: PermissionAction.RESTORE,
            subject: PostEntity
        },
        customOrder: 6,
    },
    {
        name: "content.post.read_detail",
        rule: {
            action: PermissionAction.READ_DETAIL,
            subject: PostEntity
        },
        customOrder: 6,
    },
    {
        name: "content.post.read_list",
        rule: {
            action: PermissionAction.READ_LIST,
            subject: PostEntity
        },
        customOrder: 6,
    },
    // 分类的CRUD
    {
        name: "content.category.create",
        rule: {
            action: PermissionAction.CREATE,
            subject: CategoryEntity
        },
        customOrder: 7,
    },
    {
        name: "content.category.update",
        rule: {
            action: PermissionAction.UPDATE,
            subject: CategoryEntity
        },
        customOrder: 7,   
    },
    {
        name: "content.category.delete",
        rule: {
            action: PermissionAction.DELETE,
            subject: CategoryEntity
        },
        customOrder: 7,
    },
    {
        name: "content.category.restore",
        rule: {
            action: PermissionAction.RESTORE,
            subject: CategoryEntity
        },
        customOrder: 7,
    },
    {
        name: "content.category.read_detail",
        rule: {
            action: PermissionAction.READ_DETAIL,
            subject: CategoryEntity
        },
        customOrder: 7,
    },
    {
        name: "content.category.read_list",
        rule: {
            action: PermissionAction.READ_LIST,
            subject: CategoryEntity
        },
        customOrder: 7,
    },
    // 评论的CRUD
    {
        name: "content.comment.delete",
        rule: {
            action: PermissionAction.DELETE,
            subject: CommentEntity
        },
        customOrder: 9,
    },
    {
        name: "content.comment.read_list",
        rule: {
            action: PermissionAction.READ_LIST,
            subject: CommentEntity
        },
        customOrder: 9,
    },
])

export const addContentMenus = () => ([
    {
        name: "内容管理",
        path: "/content",
        type: MenuType.DIRECTORY,
        component: "Layout",
        children: [
          {
            name: "文章管理",
            path: "/content/post",
            type: MenuType.MENU,
            component: "/views/content/post/index.vue",
            children: [
              {
                name: "创建文章",
                type: MenuType.PERMISSION,
                permission: "content.post.create"
              },  
              {
                name: "更新文章",
                type: MenuType.PERMISSION,
                permission: "content.post.update"
              },             
              {
                name: "删除文章",
                type: MenuType.PERMISSION,
                permission: "content.post.delete"
              },     
              {
                name: "恢复文章",
                type: MenuType.PERMISSION,
                permission: "content.post.restore"
              },          
              {
                name: "分页查询文章",
                type: MenuType.PERMISSION,
                permission: "content.post.read_list"
              },        
              {
                name: "文章详情",
                type: MenuType.PERMISSION,
                permission: "content.post.read_detail"
              }
            ]
          },
          {
            name: "分类管理",
            path: "/content/category",
            type: MenuType.MENU,
            component: "/views/content/category/index.vue",
            children: [
              {
                name: "创建分类",
                type: MenuType.PERMISSION,
                permission: "content.category.create"
              },  
              {
                name: "更新分类",
                type: MenuType.PERMISSION,
                permission: "content.category.update"
              },             
              {
                name: "删除分类",
                type: MenuType.PERMISSION,
                permission: "content.category.delete"
              },     
              {
                name: "恢复分类",
                type: MenuType.PERMISSION,
                permission: "content.category.restore"
              },          
              {
                name: "分页查询分类",
                type: MenuType.PERMISSION,
                permission: "content.category.read_list"
              },        
              {
                name: "分类详情",
                type: MenuType.PERMISSION,
                permission: "content.category.read_detail"
              }
            ]
          },
          {
            name: "评论管理",
            path: "/content/comment",
            type: MenuType.MENU,
            component: "/views/content/comment/index.vue",
            children: [         
              {
                name: "删除评论",
                type: MenuType.PERMISSION,
                permission: "content.comment.delete"
              },             
              {
                name: "分页查询评论",
                type: MenuType.PERMISSION,
                permission: "content.comment.read_list"
              },        
            ]
          },
        ]
      }
])