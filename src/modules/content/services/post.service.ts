import { Injectable } from '@nestjs/common';
import { Not, SelectQueryBuilder, IsNull, In, Like } from 'typeorm';
import { PostRepository, CategoryRepository } from '@/modules/content/repositorys';
import { CategoryService } from './';
import { OrderField } from '../constants';
import { isFunction, omit, isNil } from 'lodash';
import { QueryHook, QueryTrashMode } from '@/modules/utils';
import { PostEntity } from '../entities';
// import { paginate } from '@/modules/database/paginate';
import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { BaseService } from '@/modules/core/crud';
import { UserService } from '@/modules/user/services';

// 文章查询接口
type FindParams = {
    [key in keyof Omit<QueryPostDto, 'limit' | 'page'>]: QueryPostDto[key];
};

@Injectable()
export class PostService extends BaseService<PostEntity, PostRepository, FindParams> {
    constructor(
        protected repo: PostRepository,
        private categoryRepository: CategoryRepository,
        private categoryService: CategoryService,
        private userService: UserService
    ) {
        super(repo);
    }

    async create(data: CreatePostDto, author: string) {
        const post = await this.repo.save({
            ...data,
            categories:
                !isNil(data.categories) &&
                Array.isArray(data.categories) &&
                data.categories.length > 0
                    ? await this.categoryRepository.findBy({ id: In(data.categories) })
                    : [],
            author: await this.userService.findOneByCondition({id: author})
        });
        return post;
    }

    /**
     *
     * @param data 更新方法可以id不存在，直接update即可
     * @returns
     */
    async update(data: UpdatePostDto) {
        // post
        await this.repo.update(data.id, omit(data, ['id', 'categories']));
        const post = await this.detail(data.id);

        if (Array.isArray(data.categories)) {
            // 更新文章所属分类
            await this.repo
                .createQueryBuilder('post')
                .relation(PostEntity, 'categories')
                .of(post)
                .addAndRemove(data.categories, post.categories ?? []);
        }
        return this.detail(data.id);
    }

    /**
     * 构建列表查询的sql语句，并得到结果
     * @param qb 查询语句
     * @param options
     * @param callback
     * @returns
     */
    protected async buildListQuery(
        qb: SelectQueryBuilder<PostEntity>,
        options: FindParams,
        callback?: QueryHook<PostEntity>,
    ) {
        const { customOrder, isPublished, category, title, trashed } = options;

        if (typeof isPublished === 'boolean') {
            qb = isPublished
                ? qb.where({
                      publishedAt: Not(IsNull()),
                  })
                : qb.where({
                      publishedAt: IsNull(),
                  });
        }
        if (!isNil(title)) {
            qb = qb.where({
                title: Like(`%${title}%`),
            });
        }

        if (trashed === QueryTrashMode.ALL || trashed === QueryTrashMode.ONLY) {
            // 查询软删除数据
            qb = qb.withDeleted();
            if (trashed === QueryTrashMode.ONLY) {
                // 仅查询deletedAt不为null的
                qb = qb.where({
                    deletedAt: Not(IsNull())
                })
            }
        }

        // 处理排序
        qb = this.orderPost(qb, customOrder);
        // 列表额外的查询
        qb = !isNil(callback) && isFunction(callback) ? await callback(qb) : qb;
        // 是否传入categories
        if (!isNil(category)) {
            qb = await this.filterPostsByCategories(qb, category);
        }
        return qb;
    }

    protected async filterPostsByCategories(qb: SelectQueryBuilder<PostEntity>, id: string) {
        // category的id只能在categories中
        // id对应的分类
        const category = await this.categoryService.detail(id);
        // 该分类的所有后代
        const tree = await this.categoryRepository.findDescendantsTree(category);
        // 展平树
        const list = await this.categoryRepository.toFlatTrees(tree.children, 0);
        // 所有的分类id
        const ids = [tree.id, ...list.map((item) => item.id)];
        qb.andWhere('categories.id in (:...ids)', {
            ids,
        });
        return qb;
    }

    /**
     * 处理排序
     * @param qb
     * @param orderBy
     * @returns
     */
    protected orderPost(qb: SelectQueryBuilder<PostEntity>, orderBy: OrderField) {
        switch (orderBy) {
            case OrderField.CREATED: {
                qb = qb.orderBy('post.createdAt', 'DESC');
                return qb;
            }
            case OrderField.PUBLISHED: {
                qb = qb.orderBy('post.publishedAt', 'DESC');
                return qb;
            }
            case OrderField.UPDATED: {
                qb = qb.orderBy('post.updatedAt', 'DESC');
                return qb;
            }
            case OrderField.CUSTOM: {
                qb = qb.orderBy('customOrder', 'DESC');
                return qb;
            }
            case OrderField.COMMENTCOUNT: {
                qb = qb.orderBy('commentCount', 'ASC');
                return qb;
            }
            default: {
                qb = qb
                    .orderBy('post.createdAt')
                    .addOrderBy('post.publishedAt')
                    .addOrderBy('post.updatedAt')
                    .addOrderBy('commentCount');

                return qb;
            }
        }
    }
}
