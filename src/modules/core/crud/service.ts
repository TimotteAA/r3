import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder, Not, IsNull } from 'typeorm';
import { BaseRepository } from './repository';
import { BaseTreeRepository } from './tree.repository';
import { QueryListParams, QueryParams, QueryTrashMode } from '@/modules/utils';
import { PaginateMeta, PaginateOptions, QueryHook } from '@/modules/utils';
import { isNil } from 'lodash';
import { paginate, treePaginate } from '@/modules/database/paginate';

/**
 * @template E 查询的entity类
 * @template P 查询参数类型
 * @template M 分页查询返回的meta类型
 */
export abstract class BaseService<
    E extends ObjectLiteral,
    R extends BaseRepository<E> | BaseTreeRepository<E>,
    P extends QueryListParams<E> = QueryListParams<E>,
    M extends PaginateMeta = PaginateMeta,
> {
    /**
     * repo，由继承的子类传入
     */
    protected repo: R;

    /**
     * 是否开启软删除功能
     */
    protected enable_trash = true;

    constructor(repo: R) {
        this.repo = repo;

        if (!(this.repo instanceof BaseRepository || this.repo instanceof BaseTreeRepository)) {
            throw new Error(
                'Repository must instance of BaseRepository or BaseTreeRepository in DataService!',
            );
        }
    }

    /**
     * update方法服务类自己实现
     */
    create(...data: any[]): Promise<E> {
        throw new ForbiddenException(`Can not to update ${this.repo.getAlias()}!`);
    }

    /**
     * update方法服务类自己实现
     */
    update(...data: any[]): Promise<E> {
        throw new ForbiddenException(`Can not to update ${this.repo.getAlias()}!`);
    }

    /**
     * 分页查询
     * @param options 分页选项
     * @param callback
     * @returns
     */
    async paginate(options: PaginateOptions & P, callback?: QueryHook<E>) {
        const queryOptions = options ?? ({} as P);
        if (this.repo instanceof BaseTreeRepository) {
            // 树形的repository，得先拿到树
            const data = (await this.list(queryOptions, callback)) as E[];
            return treePaginate(options, data);
        }
        // 普通的repository
        // const qb = await this.buildListQuery(this.repo.buildBaseQuery(), queryOptions, callback);
        const qb = (await this.list(queryOptions, callback)) as SelectQueryBuilder<E>;
        return paginate(qb, options);
    }

    /**
     * 返回所有的列表查询
     * @param params
     * @param callback
     * @returns SelectQueryBuilder<E> | E[]
     * @returns 树形数据是全部都返回，非树形是返回查询器
     */
    async list(params?: P, callback?: QueryHook<E>) {
        // 查询options
        const options = params ?? ({} as P);
        // @ts-ignore
        // 查询别名
        const alias = this.repo.getAlias();
        // 是否查询回收站
        const trashed = params.trashed ?? QueryTrashMode.NONE;
        if (this.repo instanceof BaseTreeRepository) {
            // 树形数据
            // 下面是仅针对树形数据的软删除
            let addQuery: QueryParams<E>['addQuery'];
            if (trashed === QueryTrashMode.ONLY) {
                // 仅查询回收站数据
                addQuery = (qb) => qb.where(`${alias}.deletedAt IS NOT NUll`);
            }
            const tree = await this.repo.findTrees({
                ...options,
                addQuery,
                withTrashed: trashed === QueryTrashMode.ALL || trashed === QueryTrashMode.ONLY,
            });
            return this.repo.toFlatTrees(tree);
        }
        // 普通
        const qb = await this.buildListQuery(this.repo.buildBaseQuery(), options, callback);
        return qb;
    }

    /**
     * 查询entity
     * @param id
     * @param trashed
     * @param callback
     * @returns
     */
    async detail(id: string, trashed?: boolean, callback?: QueryHook<E>) {
        let qb = await this.buildItemQuery(
            this.repo.buildBaseQuery(this.repo.createQueryBuilder(this.repo.getAlias())),
            callback,
        );
        qb = qb.where(`${this.repo.getAlias()}.id = :id`, { id });
        if (trashed) {
            qb.withDeleted();
        }
        const item = await qb.getOne();
        if (isNil(item))
            throw new NotFoundException(`${this.repo.getAlias()} with id does not exist`);
        return item;
    }

    /**
     * 删除数据
     * @param id
     * @param trashed 是否为软删除
     * @returns
     */
    async delete(id: string, trashed?: boolean) {
        // 删除前进行查找
        const item = await this.repo.findOneOrFail({
            where: { id } as any,
            withDeleted: this.enable_trash ? true : false,
        });
        // 软删除
        if (this.enable_trash && trashed && isNil((item as any).deletetAt)) {
            return this.repo.softRemove(item);
        }
        return this.repo.remove(item);
    }

    /**
     * 批量删除
     * @returns 返回删除后的剩余数据列表
     */
    async deleteList(ids: string[], params?: P, trash?: boolean, callback?: QueryHook<E>) {
        // 默认是软删除
        const isTrash = trash === undefined ? true : trash;
        for (const id of ids) {
            await this.delete(id, isTrash);
        }
        // 返回删除后的数据列表
        return this.list(params, callback);
    }

    /**
     * 批量删除
     * @returns 删除后，对返回的数据进行分页
     */
    async deletePaginate(
        ids: string[],
        params?: PaginateOptions & P,
        trash?: boolean,
        callback?: QueryHook<E>,
    ) {
        // 默认是软删除
        const isTrash = trash === undefined ? true : trash;
        for (const id of ids) {
            await this.delete(id, isTrash);
        }
        return this.paginate(params, callback);
    }

    /**
     *
     */
    async restore(id: string, callback?: QueryHook<E>) {
        if (!this.enable_trash) {
            // 默认不开启软删除
            throw new ForbiddenException(
                `Can not to restore ${this.repo.getAlias()}, because trash not enabled!`,
            );
        }
        // 恢复前查找
        const item = await this.repo.findOneOrFail({
            where: {
                id,
            } as any,
            withDeleted: true,
        });
        // deletedAt有值表示确实是软删除，防止误传
        if ((item as any).deletedAt) {
            await this.repo.restore(item.id);
        }
        return this.detail(item.id, false, callback);
    }

    /**
     * 恢复数据
     * @returns 返回恢复后的数据列表
     */
    async restoreList(ids: string[], params?: P, callback?: QueryHook<E>) {
        for (const id of ids) {
            await this.restore(id);
        }
        return this.list(params, callback);
    }

    /**
     * 恢复数据
     * @returns 返回恢复后的数据列表
     */
    async restorePaginate(ids: string[], params?: PaginateOptions & P, callback?: QueryHook<E>) {
        for (const id of ids) {
            await this.restore(id);
        }
        return this.paginate(params, callback);
    }

    /**
     * 构建列表查询器，非树形entity
     * 处理查询器的软删除、额外查询功能
     * @param qb
     * @param options
     * @param callback 额外的查询
     * @returns
     */
    protected async buildListQuery(qb: SelectQueryBuilder<E>, options: P, callback?: QueryHook<E>) {
        const alias = this.repo.getAlias();
        // 是否查询回收站
        const { trashed } = options;
        if (trashed === QueryTrashMode.ALL || trashed === QueryTrashMode.ONLY) {
            // 查询软删除数据
            qb.withDeleted();
            if (trashed === QueryTrashMode.ONLY) {
                // 仅查询软删除数据
                qb.where(`${alias}.deletedAt = :deleted`, { deleted: Not(IsNull()) });
            }
        }

        // 额外查询，比如关联关系？
        qb = !isNil(callback) ? await callback(qb) : qb;
        return qb;
    }

    /**
     * 构建单个项的查询器
     * 处理查询器的额外查询功能
     * @param qb
     * @param callback
     * @returns
     */
    protected async buildItemQuery(qb: SelectQueryBuilder<E>, callback?: QueryHook<E>) {
        return !isNil(callback) ? await callback(qb) : qb;
    }
}
