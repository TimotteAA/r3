import { Type } from "class-transformer";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from "typeorm";

import { MenuType } from "../constants";
import { PermissionEntity } from "./permission.entity";

/**
 * CRUD菜单
 */
@Entity("rbac_menus")
@Tree("materialized-path")
export class MenuEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid") 
    id!: string;

    @Column({
        comment: "菜单名称"
    })
    name!: string;

    @Column({
        type: "enum",
        comment: "菜单类型",
        enum: MenuType
    })
    type!: MenuType;

    @Column({
        comment: "路径",
        nullable: true
    })
    path?: string;
    
    @Column({
        comment: "目录或者菜单的icon，取决于前端组件库",
        nullable: true,
    })
    icon?: string;

    @Column({
        comment: "目录或者菜单对应的前端组件，比如目录是Layout，菜单项是某个 views/system/user/index.tsx",
        nullable: true
    })
    component?: string;

    @Column({
        comment: "菜单项的path是否是外链"
    })
    external?: boolean;

    @OneToOne(() => PermissionEntity, (p) => p.menu)
    @JoinColumn()
    permission!: PermissionEntity;

    @Type(() => MenuEntity)
    @TreeParent({ onDelete: "CASCADE" })
    parent!: MenuEntity | null;

    @Type(() => MenuEntity)
    @TreeChildren({ cascade: true })
    children!: MenuEntity | null;
}   