import { Column, Entity, OneToOne } from "typeorm";
import { Expose } from "class-transformer";

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

  @Expose()
  @Column({comment: "文件描述"})
  description!: string;

  @Expose()
  @Column({ comment: "是否是第三方授权的头像", default: false })
  isThird?: boolean;

  @Expose()
  @Column({comment: "第三方授权登录头像地址", nullable: true})
  thirdSrc?: string;
}