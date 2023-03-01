import { BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

export class BaseFileEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ comment: "文件扩展名",nullable: true })
  ext?: string;

  @Column({ comment: "腾讯云cos存储名", nullable: true })
  key?: string;

  @CreateDateColumn()
  createdAt!: Date;
}