import { PostEntity, CommentEntity } from '@/modules/content/entities';
import {
    PrimaryGeneratedColumn,
    Column,
    Entity,
    BaseEntity,
    OneToMany,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { AccessTokenEntity } from './access-token.entity';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
@Entity('user_users')
export class UserEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Expose()
    @Column({ comment: '用户昵称', nullable: true, default: null })
    nickname?: string;

    @Expose()
    @Column({ comment: '用户名' })
    username!: string;

    @Column({ comment: '用户密码', length: 500 })
    password!: string;

    @Expose({groups: ['user-detail', "user-list"]})
    @Column({comment: "用户手机", nullable: true, unique: true})
    phone?: string;

    @Expose({groups: ['user-detail', "user-list"]})
    @Column({ comment: '用户邮箱', default: null, unique: true })
    email?: string;


    // 下面是关联关系、软删除等字段
    @Column({comment: "用户是否激活", default: true})
    actived?: boolean;

    /**
     * user删除，post也被删除
     */
    @OneToMany(() => PostEntity, (post: PostEntity) => post.author, {
        cascade: true,
    })
    posts!: PostEntity[];

    @OneToMany(() => CommentEntity, (comment: CommentEntity) => comment.author, {
        cascade: true
    })
    comments!: CommentEntity[];

    @OneToMany(() => AccessTokenEntity, (token: AccessTokenEntity) => token.user, {
        cascade: true,
    })
    accessTokens!: AccessTokenEntity[];

    @Expose({ groups: ['user-detail', 'user-list'] })
    @Type(() => Date)
    @CreateDateColumn()
    createdAt!: Date;

    @Expose({ groups: ['user-detail', 'user-list'] })
    @Type(() => Date)
    @UpdateDateColumn()
    updatedAt!: Date;

    @Expose({ groups: ['user-detail', 'user-list'] })
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt!: Date;

    @Expose({ groups: ['user-detail', 'user-list'] })
    trashed!: boolean;
}
