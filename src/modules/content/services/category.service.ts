import { Injectable } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';
import { QueryCategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../dtos';
import { CategoryRepository } from '../repositorys';
import { treePaginate } from '@/modules/database/paginate';
import { CategoryEntity } from '../entities';
import { isNil, omit } from 'lodash';
import { BaseService } from '@/modules/core/crud/service';

@Injectable()
export class CategoryService extends BaseService<CategoryEntity, CategoryRepository> {
    constructor(protected repo: CategoryRepository) {
        super(repo);
    }

    /**
     * 返回分类树
     * @returns 分类树
     */
    async findTrees() {
        const res = await this.repo.findTrees();
        // console.log('data', res);
        return res;
    }

    /**
     * 对分页列表分页
     * @param options：页数与每页数量
     * @returns
     */
    async paginate(options: QueryCategoryDto) {
        // 评论树
        const tree = await this.findTrees();
        // 展平评论树
        const data = await this.repo.toFlatTrees(tree, 0);
        // 分页函数分页
        return treePaginate(options, data);
    }

    // /**
    //  * 获取数据详情
    //  * @param id
    //  * @returns
    //  */
    // async detail(id: string) {
    //     return this.repo.findOneOrFail({ where: { id } });
    // }

    async create(data: CreateCategoryDto) {
        const item = await this.repo.save({
            ...data,
            parent: await this.getParent(undefined, data.parent),
        });
        return item;
    }

    // @ts-ignore
    async delete(id: string, trashed?: boolean) {
        // 子分类不删除，而是提升一级
        const cat = await this.repo.findOneOrFail({
            where: { id },
            relations: ['parent', 'children'],
        });
        const res = await super.delete(id);

        const children = cat.children;
        const parent = cat.parent;
        if (!isNil(children) && children.length > 0) {
            children.forEach(async (c) => {
                c.parent = parent;
                await this.repo.save(c);
            });
        }
        return res;
    }

    async update(data: UpdateCategoryDto) {
        // 新的父分类的entity
        const parent = await this.getParent(data.id, data.parent);
        // 不更新id字段，暂缓更新parent
        const querySet = omit(data, ['id', 'parent']);
        // console.log(querySet);
        // 更新剩余字段
        if (Object.keys(querySet).length > 0) {
            await this.repo.update(data.id, querySet);
        }
        // 更新后的category
        const updatedCat = await this.detail(data.id);
        // console.log(updatedCat);
        // parent为null，更新前的parent不为null
        // parent不为null，更新前的为null
        // 两者不一致
        const shouldUpdateParent =
            (isNil(updatedCat.parent) && !isNil(parent)) ||
            (!isNil(updatedCat.parent) && isNil(parent)) ||
            (!isNil(updatedCat.parent) && !isNil(parent) && parent.id !== updatedCat.parent.id);
        if (parent !== undefined && shouldUpdateParent) {
            // null才是顶级分类
            updatedCat.parent = parent;
            await this.repo.save(updatedCat);
        }
        return updatedCat;
    }

    protected async getParent(current?: string, parentId?: string) {
        // 传进来一样的参数
        if (current === parentId) return undefined;
        // 刚创建Entity，父parent也没有
        if (current === undefined && parentId === undefined) return undefined;
        let parent: CategoryEntity | null;
        if (parentId !== undefined) {
            // 顶级分类
            if (parentId === null) return null;

            parent = await this.repo.findOne({
                where: {
                    id: parentId,
                },
            });
            if (!parent)
                throw new EntityNotFoundError(
                    CategoryEntity,
                    `Parent category ${parentId} not exists!`,
                );
        }
        return parent;
    }
}