import {
    PrimaryGeneratedColumn,
    Column,
    Entity,
    BaseEntity,
    OneToMany,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { AccessTokenEntity, MessageEntity, MessageReceiveEntity } from '.';
import { Exclude, Expose, Type } from 'class-transformer';
import { AddRelations } from '@/modules/database/decorators';
import { RoleEntity } from '@/modules/rbac/entities/role.entity';
import { PermissionEntity } from '@/modules/rbac/entities/permission.entity';
import { AvatarEntity } from '@/modules/media/entities';
import { getUserConfig } from '../helpers';
import { DynamicRelation } from '@/modules/database/types';
import { ActionEntity } from '@/modules/actions/entities/action.entity';

const relations = () => getUserConfig<DynamicRelation[]>("relations")

/**
 * 给user字段加上动态关联
 */
@AddRelations(relations)
@Exclude()
@Entity('user_users')
export class UserEntity extends BaseEntity {
    // 动态关联字段
    [key: string]: any;

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

    // @Expose({ groups: ['user-detail', "user-list"] })
    @OneToOne(() => AvatarEntity, (avatar) => avatar.user, {
        nullable: true
    })
    @JoinColumn()
    avatar?: AvatarEntity
    
    @Expose()
    avatarSrc?: string;

    @Expose()
    @Column({ comment: "是否是创始人", default: false })
    isCreator?: boolean

    // 下面是关联关系、软删除等字段
    @Column({comment: "用户是否激活", default: true})
    actived?: boolean;

    // 发送的消息
    @OneToMany(() => MessageEntity, (message) => message.sender, {
        cascade: true
    })
    sends: MessageEntity[]

    // 收到的消息
    @OneToMany(() => MessageReceiveEntity, (item) => item.receiver, {
        cascade: true
    })
    messages: MessageReceiveEntity[]

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

    @Expose()
    @ManyToMany(() => RoleEntity, (role: RoleEntity) => role.users, {
        cascade: true
    })
    @JoinTable()
    roles!: RoleEntity[]

    @Expose()
    @ManyToMany(() => PermissionEntity, (p: PermissionEntity) => p.users, {
        cascade: true
    })
    @JoinTable()
    permissions!: PermissionEntity[]

    // // 上传的文件
    // @OneToMany(() => MediaEntity, (media) => media.user, {
    //     cascade: true
    // })
    // medias: MediaEntity[]

    @OneToMany(() => ActionEntity, (action: ActionEntity) => action.user, {
        cascade: true
    })
    actions: ActionEntity[]
}
