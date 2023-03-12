import { BaseEntity, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Expose, Type } from "class-transformer";

import { BaseFileEntity } from "./base-file.entity";


@Entity("media_banners")
export class BannerEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        comment: "轮播图名称"
    })
    name!: string;
    
    @Expose()
    @Column({
        comment: "轮播图跳转链接",
        nullable: true
    })
    link?: string;

    @Expose()
    @Column({
        comment: "轮播图描述",
        nullable: true
    })
    description?: string;

    /**
     * 轮播图url虚拟字段
     */
    @Expose()
    src?: string;

    @Type(() => Date)
    @CreateDateColumn()
    createdAt!: Date;

    @Type(() => Date)
    @UpdateDateColumn()
    updatetAt!: Date;

    @Column({
        comment: "轮播图排序字段"
    })
    customOrder: number = 0;

    @OneToOne(() => BaseFileEntity, (file) => file.banner, {
        cascade: true,
        // eager: true
    })
    image!: BaseFileEntity;
}