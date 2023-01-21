import { Injectable } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';
import { QueryCategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../dtos';
import { CategoryRepository } from '../repositorys';
import { treePaginate } from '@/modules/database/paginate';
import { CategoryEntity } from '../entities';
import { isNil, omit } from 'lodash';

@Injectable()
export class CategoryService {
    constructor(private repo: CategoryRepository) {}

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

    /**
     * 获取数据详情
     * @param id
     * @returns
     */
    async detail(id: string) {
        return this.repo.findOneOrFail({ where: { id } });
    }

    async create(data: CreateCategoryDto) {
        const item = await this.repo.save({
            ...data,
            parent: await this.getParent(undefined, data.parent),
        });
        return item;
    }

    async delete(id: string) {
        // 子分类不删除，而是提升一级
        const cat = await this.repo.findOneOrFail({
            where: { id },
            relations: ['parent', 'children'],
        });
        const children = cat.children;
        const parent = cat.parent;
        if (!isNil(children) && children.length > 0) {
            children.forEach(async (c) => {
                c.parent = parent;
                await this.repo.save(c);
            });
        }
        await this.repo.delete(cat.id);
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

    /**
     *
     * @param current 当前分类的id
     * @param id 当前分类的父分类的id
     * @returns
     */
    protected async getParent(current?: string, id?: string) {
        // 刚创建，且没有父分类
        if (current === undefined && id === undefined) return undefined;
        // 传入了一样的值
        if (current === id) return undefined;

        let parent: CategoryEntity | undefined;
        if (id !== undefined) {
            // 父分类顶级分类
            if (id === null) return null;
            parent = await this.repo.findOne({ where: { id } });
            if (!parent)
                throw new EntityNotFoundError(CategoryEntity, `Parent category ${id} not exists!`);
        }
        return parent;
    }
}
