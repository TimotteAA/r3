import { Exclude, Expose, Type } from "class-transformer";
import { BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn, Entity } from "typeorm";
import { BannerEntity } from "./banner.entity";

@Entity("medias")
@Exclude()
export class BaseFileEntity extends BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Expose()
  @Column({ comment: "文件扩展名",nullable: true })
  ext?: string;

  @Expose()
  @Column({ comment: "腾讯云cos存储名", nullable: true })
  key?: string;

  @Expose()
  @Column({ comment: "存储bucket", nullable: true })
  bucketPrefix?: string;

  @Type(() => Date)
  @Expose()
  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => BannerEntity, (banner) => banner.image, {
    onUpdate: "CASCADE",
    onDelete: 'CASCADE',
    nullable: true
  })
  @JoinColumn()
  banner?: BannerEntity;
}