import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    CreateDateColumn,
    BaseEntity,
    ManyToMany,
    JoinTable,
    OneToMany,
    ManyToOne,
} from 'typeorm';
import { Exclude, Expose, Type } from 'class-transformer';
import { PostBodyType } from '@/modules/content/constants';
import { CategoryEntity } from './category.entity';
import { CommentEntity } from './comment.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';

@Exclude()
@Entity('content_posts')
export class PostEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Expose()
    @Column({ comment: '文字标题' })
    title!: string;

    @Expose({ groups: ['post-detail'] })
    @Column({ type: 'longtext', comment: '文章内容' })
    body!: string;

    @Expose()
    @Column({ comment: '文章总结', nullable: true })
    summary?: string;

    @Expose()
    @Column({ comment: '文章关键词', type: 'simple-array', nullable: true })
    keywords?: string[];

    @Expose()
    @Column({
        type: 'enum',
        enum: PostBodyType,
        default: PostBodyType.HTML,
        comment: '文章类型',
    })
    type!: PostBodyType;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn()
    updatedAt!: Date;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn()
    createdAt!: Date;

    @Expose()
    @Type(() => Date)
    @Column({ comment: '发表时间', nullable: true })
    publishedAt?: Date;

    @Expose()
    @Column({ comment: '文章排序值', default: 0 })
    customOrder!: number;

    @Expose()
    // 此处cascade表示如果文章中的分类没有，会被创建
    @ManyToMany(() => CategoryEntity, (category) => category.posts, {
        cascade: true,
    })
    @JoinTable()
    categories!: CategoryEntity[];

    @OneToMany(() => CommentEntity, (comment) => comment.post, {
        cascade: true,
    })
    comments!: CommentEntity[];

    @Expose()
    commentCount!: number;

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.posts, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @Expose()
    author!: UserEntity;
}
