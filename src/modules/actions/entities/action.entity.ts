import { Exclude, Expose } from "class-transformer";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { TypeAction, TypeStuff } from "../constants";
import { UserEntity } from "@/modules/user/entities";

@Exclude()
@Entity("actions")
export class ActionEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Expose()
    @Column({
        type: "enum",
        enum: TypeAction,
        comment: "用户做出的行为"
    })
    actionType!: TypeAction;

    @Expose()
    @Column({
        type: "enum",
        enum: TypeStuff,
        comment: "用户行为的对象类型"
    })
    stuffType!: TypeStuff;

    @Expose()
    @Column({
        type: "uuid",
        comment: "对象ID"
    })
    stuffId!: string;

    @Expose()
    @ManyToOne(() => UserEntity, (user: UserEntity) => user.actions, {
        onDelete: "CASCADE",
        nullable: false
    })
    user!: UserEntity;
}