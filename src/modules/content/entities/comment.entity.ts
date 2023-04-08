import {
    Entity,
    Tree,
    TreeParent,
    Column,
    TreeChildren,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { Exclude, Expose, Type } from 'class-transformer';
import { PostEntity } from './post.entity';
import { UserEntity } from '@/modules/user/entities';

/**
 * 评论不用展平
 */
@Exclude()
@Entity('content_comment')
@Tree('materialized-path')
export class CommentEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Expose()
    @Column({
        type: "varchar",
        length: "1000"
    })
    content!: string;

    // 一
    @TreeParent({
        onDelete: 'CASCADE',
    })
    parent!: CommentEntity | null;

    @Expose()
    // 多
    @TreeChildren({
        cascade: true,
    })
    children!: CommentEntity[];

    @Expose()
    depth: number = 0;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt!: Date;

    @Expose()
    @ManyToOne(() => PostEntity, (post) => post.comments, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    // post
    post!: PostEntity;

    // 评论作者
    @Expose()
    @ManyToOne(() => UserEntity, (author) => author.comments, {
        onDelete: "CASCADE",
        nullable: false
    })
    author!: UserEntity;

    /**
     * 点赞数
     */
    @Expose()
    likeCounts: number = 0;

    /**
     * 点赞者
     */
    @Expose()
    likers: UserEntity[] = [];

    /**
     * 讨厌数
     */
    @Expose()
    hateCounts: number = 0;
}
