import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToOne } from "typeorm";

import { UserEntity } from "@/modules/user/entities";


@Entity("medias")
export class MediaEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ comment: "文件扩展名" })
  ext!: string;

  @Column({ comment: "腾讯云cos存储名" })
  file!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.medias, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: true
  })
  user?: UserEntity;
  
  /**
   * 头像所属的用户
   */
  @OneToOne(() => UserEntity, (user) => user.avatar, {
    nullable: true
  })
  member?: UserEntity;
}