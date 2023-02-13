import { Column, Entity, OneToOne } from "typeorm";

import { BaseFileEntity } from "./base-file.entity";
import { UserEntity } from "@/modules/user/entities";


@Entity("medias_avatars")
export class AvatarEntity extends BaseFileEntity {
  /**
   * 头像的用户
   */
  @OneToOne(() => UserEntity, (user) => user.avatar, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  user?: UserEntity;

  @Column({comment: "文件描述"})
  description!: string;
}