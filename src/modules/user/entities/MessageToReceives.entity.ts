import { Exclude, Expose } from "class-transformer";
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, BaseEntity } from "typeorm"
import { MessageEntity, UserEntity } from "./"

@Exclude()
@Entity("users_recevies")
export class MessageReceiveEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Expose()
    @Column({ comment: "是否已读", default: false })
    readed?: boolean;

    /**
     * 消息
     * inverse-side类那边的多
     */
    @Expose()
    @ManyToOne(() => MessageEntity, (message) => message.receives, { onDelete: "CASCADE", onUpdate:"CASCADE" })
    message!: MessageEntity

    /**
     * 接收者
     */
    @Expose()
    @ManyToOne(() => UserEntity, (receiver) => receiver.messages, { onDelete: "CASCADE", onUpdate:"CASCADE"})
    receiver: UserEntity
}