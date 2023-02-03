import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, BaseEntity } from "typeorm"
import { MessageEntity, UserEntity } from "./"

@Entity("users_recevies")
export class MessageReceiveEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ comment: "是否已读", default: false })
    readed?: boolean;

    /**
     * 消息
     * inverse-side类那边的多
     */
    @ManyToOne(() => MessageEntity, (message) => message.receives)
    message!: MessageEntity

    /**
     * 接收者
     */
    @ManyToOne(() => UserEntity, (receiver) => receiver.messages)
    receiver: UserEntity
}