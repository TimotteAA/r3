import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    Tree,
    TreeChildren,
    TreeParent,
    DeleteDateColumn,
} from 'typeorm';
import { Exclude, Expose, Type } from 'class-transformer';
import { PostEntity } from './post.entity';

@Exclude()
@Tree('materialized-path')
@Entity('content_categories')
export class CategoryEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Expose()
    @Column({ comment: '分类内容' })
    content!: string;

    @Expose({ groups: ['category-tree', 'category-detail', 'category-detail'] })
    @Column({ comment: '自定义排序', default: 0 })
    customOrder!: number;

    @Expose({ groups: ['category-list', 'category-detail'] })
    @Type(() => CategoryEntity)
    @TreeParent({ onDelete: 'NO ACTION' })
    parent!: CategoryEntity | null;

    @Type(() => CategoryEntity)
    @Expose({ groups: ['category-tree'] })
    // 父分类中的子分类没有时，插入数据库
    @TreeChildren({ cascade: true })
    children!: CategoryEntity[];

    @Expose({ groups: ['category-list'] })
    depth = 0;

    // 多对多中，另一方删除了，这一方将自己所属的字段设为null
    @ManyToMany(() => PostEntity, (post) => post.comments)
    posts!: PostEntity[];

    @DeleteDateColumn()
    deletetAt!: Date;
}
