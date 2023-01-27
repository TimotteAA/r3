import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { CaptchaActionType, CaptchaType  } from "@/modules/utils";

@Entity("user_code")
export class CodeEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  code!: string;

  @Column({type: "enum", enum: CaptchaActionType, default: CaptchaActionType.REGISTER, comment: "验证码行为"})
  action!: CaptchaActionType

  @Column({type: "enum", enum: CaptchaType, default: CaptchaType.SMS, comment: "手机验证码或邮箱验证码"})
  type!: CaptchaType

  @Column({comment: "手机号或邮箱"})
  media!: string

  @CreateDateColumn()
  createtAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}