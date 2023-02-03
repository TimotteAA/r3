import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Not, SelectQueryBuilder, IsNull, In, Like } from 'typeorm';
import { PostRepository, CategoryRepository } from '@/modules/content/repositorys';
import { CategoryService, ElasticSearchService } from './';
import { OrderField } from '../constants';
import { isFunction, omit, isNil } from 'lodash';
import { PaginateOptions, PaginateReturn, QueryHook, QueryTrashMode } from '@/modules/utils';
import { PostEntity } from '../entities';
// import { paginate } from '@/modules/database/paginate';
import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { BaseService } from '@/modules/core/crud';
import { UserService } from '@/modules/user/services';
import { SearchType } from '../types';
import { paginate, treePaginate } from '@/modules/database/paginate'; 

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
        private userService: UserService,
        private searchService?: ElasticSearchService,
        protected searchType: SearchType = "elastic"
    ) {
        super(repo);
    }

    async paginate(options: PaginateOptions & FindParams, callback?: QueryHook<PostEntity>): Promise<PaginateReturn<PostEntity>> {
        // 是否用elastic进行搜素
        if (!isNil(this.searchService) && !isNil(options.search) && this.searchType === "elastic") {
            const res = await this.searchService.search(options.search);
            const ids = res.map(item => item.id);
            // 查找所有的id
            let qb = this.repo.buildBaseQuery().where({id: In(ids)});
            // const posts = ids.length > 0 ? await this.repo.find({ where: {id: In(ids)} }) : [];
            if (callback) qb = await callback(qb);

            const posts = await qb.getMany();
            // 手动分页
            return treePaginate({
                page: options.page,
                limit: options.limit,
            }, posts)
        }

        // 普通的分页搜索
        const queryOptions = options ?? {};
        const qb = (await this.list(queryOptions, callback)) as SelectQueryBuilder<PostEntity>;
        return paginate(qb, options);
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

        // 放到es中
        if (!isNil(this.searchService)) {
            try {
                await this.searchService.create(post);
            } catch (err) {
                throw new InternalServerErrorException()
            }
        }

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

        // 更新es中的结果
        if (!isNil(this.searchService)) {
            try {
                await this.searchService.update(post);
            } catch (err) {
                throw new InternalServerErrorException(err)
            }
        }

        return this.detail(data.id);
    }

    async delete(id: string, trashed?: boolean): Promise<PostEntity> {
        // 删除es中的结果
        if (!isNil(this.searchService)) {
            try {
                await this.searchService.delete(id);
            } catch (err) {
                throw new InternalServerErrorException(err)
            }
        }
        const post = await super.delete(id, trashed);

        return post;
    }

    async restore(id: string, callback?: QueryHook<PostEntity>): Promise<PostEntity> {
        const post = await super.restore(id, callback);
        if (!isNil(this.searchService)) {
            try {
                await this.searchService.create(post);
            } catch (err) {
                throw new InternalServerErrorException(err)
            }
        }
        return post;
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
        const { customOrder, isPublished, category, search, trashed } = options;

        if (typeof isPublished === 'boolean') {
            qb = isPublished
                ? qb.andWhere({
                      publishedAt: Not(IsNull()),
                  })
                : qb.andWhere({
                      publishedAt: IsNull(),
                  });
        }
        if (!isNil(search)) {
            if (this.searchType === "like") {
                qb = qb.andWhere({
                    title: Like(`%${search}%`),
                }).orWhere({
                    body: Like(`%${search}%`)
                }).orWhere({
                    summary: Like(`%${search}%`)
                }).orWhere('categories.content LIKE :search', {
                    search: `%${search}%`
                })
            } else if (this.searchType === "against") {
                qb = qb.andWhere(`MATCH(title) AGAINST (:search IN BOOLEAN MODE)`, {
                    search: `${search}*`,
                }).orWhere(`MATCH(body) AGAINST (:search IN BOOLEAN MODE)`, {
                    search: `${search}*`,
                }).orWhere(`MATCH(summary) AGAINST (:search IN BOOLEAN MODE)`, {
                    search: `${search}*`,
                }).orWhere(`MATCH(categories.content) AGAINST (:search IN BOOLEAN MODE)`, {
                    search: `${search}*`,
                })
            }
        }

        if (trashed === QueryTrashMode.ALL || trashed === QueryTrashMode.ONLY) {
            // 查询软删除数据
            qb = qb.withDeleted();
            if (trashed === QueryTrashMode.ONLY) {
                // 仅查询deletedAt不为null的
                qb = qb.andWhere({
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
