import { Type, Expose, Exclude } from "class-transformer";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from "typeorm";

import { MenuType } from "../constants";
import { PermissionEntity } from "./permission.entity";

/**
 * CRUD菜单
 */
@Exclude()
@Entity("rbac_menus")
@Tree("materialized-path")
export class MenuEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn("uuid") 
    id!: string;

    @Expose()
    @Column({
        comment: "菜单名称"
    })
    name!: string;

    @Expose()
    @Column({
        type: "enum",
        comment: "菜单类型",
        enum: MenuType
    })
    type!: MenuType;

    @Expose()
    @Column({
        comment: "路径",
        nullable: true
    })
    path?: string;
    
    @Expose()
    @Column({
        comment: "目录或者菜单的icon，取决于前端组件库",
        nullable: true,
    })
    icon?: string;

    @Expose()
    @Column({
        comment: "目录或者菜单对应的前端组件，比如目录是Layout，菜单项是某个 views/system/user/index.tsx",
        nullable: true
    })
    component?: string;

    @Expose()
    @Column({
        comment: "菜单项的path是否是外链",
        default: false
    })
    external?: boolean;

    @Column({
        comment: '是否是每个人都有的菜单',
        default: false,
    })
    static?: boolean;

    @Exclude()
    @OneToOne(() => PermissionEntity, (p) => p.menu)
    @JoinColumn()
    p!: PermissionEntity;

    @Expose()
    permission: string;

    @Type(() => MenuEntity)
    @TreeParent({ onDelete: "CASCADE" })
    parent!: MenuEntity | null;

    @Expose()
    @Type(() => MenuEntity)
    @TreeChildren({ cascade: true })
    children!: MenuEntity[];
}   