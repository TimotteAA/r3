import { Injectable, ForbiddenException } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';
import { QueryCommentDto, CreateCommentDto, QueryCommentTreeDto } from '../dtos';
import { CommentRepository, PostRepository } from '../repositorys';
import { treePaginate } from '@/modules/database/paginate';
import { CommentEntity } from '../entities';
import { isNil } from 'lodash';
import { SelectQueryBuilder } from 'typeorm';
import { BaseService } from '@/modules/core/crud';
import { UserService } from '@/modules/user/services';

@Injectable()
export class CommentService extends BaseService<CommentEntity, CommentRepository> {
    constructor(protected repo: CommentRepository, private postRepo: PostRepository, private userService: UserService) {
        super(repo);
    }

    /**
     * 返回评论树，支持查看某篇文章的评论树
     * @returns 评论树
     */
    async findTrees(options: QueryCommentTreeDto = {}) {
        return this.repo.findTrees({ post: options.post });
    }

    /**
     * 单片文章分页处理
     * @param options：页数与每页数量
     * @returns
     */
    async paginate(options: QueryCommentDto) {
        const { post, ...rest } = options;
        const addQuery = (qb: SelectQueryBuilder<CommentEntity>) => {
            // return isNil(post) ? qb :  qb.andWhere('post.id = :id', { id: post})
            const condition: Record<string, string> = {};
            if (!isNil(post)) condition.post = post;
            return Object.keys(condition).length > 0 ? qb.andWhere(condition) : qb;
        };
        const data = await this.repo.findTrees({ addQuery });
        let comments: CommentEntity[] = [];
        for (let i = 0; i < data.length; i++) {
            const c = data[i];
            // 查询后代
            comments.push(
                await this.repo.findDescendantsTree(c, {
                    addQuery,
                }),
            );
        }

        comments = await this.repo.toFlatTrees(comments);
        return treePaginate(rest, comments);
    }

    /**
     * 获取数据详情
     * @param id
     * @returns
     */
    async detail(id: string) {
        return this.repo.findOneOrFail({ where: { id } });
    }

    async create(data: CreateCommentDto, author: string) {
        const parent = await this.getParent(undefined, data.parent);
        // 父评论存在的情况下，文章id是否一致
        if (!isNil(parent) && parent.post.id !== data.post) {
            throw new ForbiddenException('Parent comment and child comment must belong same post!');
        }
        const item = await this.repo.save({
            ...data,
            parent: await this.getParent(undefined, data.parent),
            post: await this.getPost(data.post),
            author: await this.userService.findOneByCondition({id: author})
        });
        return item;
    }

    async getPost(id: string) {
        const post = await this.postRepo.findOneOrFail({
            where: { id: id },
        });
        return post;
    }

    /**
     *
     * @param current 当前评论的id
     * @param id 当前分类的父分类的id
     * @returns
     */
    protected async getParent(current?: string, id?: string) {
        // 刚创建，且没有父分类
        if (current === undefined && id === undefined) return undefined;
        // 传入了一样的值
        if (current === id) return undefined;

        let parent: CommentEntity | undefined;
        if (id !== undefined) {
            // 父分类顶级分类
            if (id === null) return null;
            parent = await this.repo.findOne({ where: { id }, relations: ['parent', 'post'] });
            if (!parent)
                throw new EntityNotFoundError(CommentEntity, `Parent category ${id} not exists!`);
        }
        return parent;
    }
}
