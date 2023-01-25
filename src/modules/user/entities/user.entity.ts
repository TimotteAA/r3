import { PostEntity } from '@/modules/content/entities';
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
    @Column({ comment: '用户昵称' })
    nickname?: string;

    @Expose()
    @Column({ comment: '用户邮箱', default: null })
    email?: string;

    @Expose()
    @Column({ comment: '用户名' })
    username!: string;

    @Column({ comment: '用户密码' })
    password!: string;

    @OneToMany(() => PostEntity, (post: PostEntity) => post.author, {
        cascade: true,
    })
    posts!: PostEntity[];

    @OneToMany(() => AccessTokenEntity, (token: AccessTokenEntity) => token.user, {
        cascade: true,
    })
    accessTokens!: AccessTokenEntity[];

    @Expose()
    @Type(() => Date)
    @CreateDateColumn()
    createtAt!: Date;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn()
    updatedtAt!: Date;

    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt!: Date;

    @Expose()
    trashed!: boolean;
}
