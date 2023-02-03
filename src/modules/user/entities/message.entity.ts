import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Exclude, Expose, Transform } from "class-transformer";
import { UserEntity, MessageReceiveEntity } from "./";

@Exclude()
@Entity("user_messages")
export class MessageEntity extends BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Expose()
  @Column({comment: "消息标题", nullable: true})
  title?: string;

  @Expose()
  @Column({comment: "消息内容", type: "longtext"})
  body!: string

  @Expose()
  @Column({
    comment: "消息类型、可以是icon的url，也可以是链接地址",
    nullable: true
  })
  type?: string;

  @Expose()
  @Transform(() => Date)
  @CreateDateColumn({comment: "创建时间"})
  createdAt!: Date;

  /**
   * 消息发送者
   */
  @ManyToOne(() => UserEntity, (user) => user.sends, {
    onDelete: "CASCADE",
    nullable: false
  })
  sender!: UserEntity

  /**
   * 消息接收者
   */
  @OneToMany(() => MessageReceiveEntity, (item) => item.message)
  receives!: MessageReceiveEntity[];

  receiver: MessageReceiveEntity;
}