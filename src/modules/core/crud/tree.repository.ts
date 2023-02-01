import { isNil, unset } from 'lodash';
import {
    FindOptionsUtils,
    ObjectLiteral,
    TreeRepository,
    EntityTarget,
    EntityManager,
    QueryRunner,
    TreeRepositoryUtils,
    SelectQueryBuilder,
} from 'typeorm';
import { QueryTreeOptions, getQrderByQuery } from '@/modules/utils';

/**
 * buildBasicQuery -> findRoots，其中支持额外查询与排序 -> findTress
 * createDtsQueryBuilder，其中支持额外查询与排序 -> 后代查找
 * createAtsQueryBuilder，其中支持额外查询与排序 -> 祖先查找
 * 从而实现后代、祖先查找的额外查找、排序
 */
export class BaseTreeRepository<E extends ObjectLiteral> extends TreeRepository<E> {
    /**
     * query-builder中的alias的名称
     */
    protected alias = 'treeEntity';

    /**
     * @description 默认排序规则，可以通过每个方法的orderBy选项进行覆盖
     * @protected
     * @type {(string | { name: string; order:)}
     */
    protected orderBy?: string | { name: string; order: 'ASC' | 'DESC' };

    getAlias() {
        return this.alias;
    }

    /**
     * 调用父类的构造器获得实例
     */
    constructor(target: EntityTarget<E>, manager: EntityManager, queryRunner?: QueryRunner) {
        super(target, manager, queryRunner);
    }

    /**
     * 构建基础查询器，默认关联上了parent字段
     */
    buildBaseQuery(qb: SelectQueryBuilder<E>): SelectQueryBuilder<E> {
        throw new Error('子类必须实现buildBaseQuery方法');
    }

    /**
     * 查找顶级分类
     * 支持额外查询与排序
     * @param options
     * @returns
     */
    async findRoots(options: QueryTreeOptions<E> = {}) {
        const { addQuery, orderBy, withTrashed, ...rest } = options;
        const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);
        const joinColumn = this.metadata.treeParentRelation.joinColumns[0];
        const parentPropertyName = joinColumn.givenDatabaseName || joinColumn.databaseName;
        // 使用自定义的基本查询器
        let qb = this.buildBaseQuery(this.createQueryBuilder(this.alias));
        qb.where(`${escapeAlias(this.alias)}.${escapeColumn(parentPropertyName)} IS NULL`);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, rest);

        // 是否有额外查询
        qb = !isNil(addQuery) ? addQuery(qb) : qb;

        // 软查询？
        if (withTrashed) {
            qb = qb.withDeleted();
        }

        // 是否排序
        qb = !isNil(orderBy) ? getQrderByQuery(qb, this.alias, orderBy || this.orderBy) : qb;

        return qb.getMany();
    }

    async findTrees(options: QueryTreeOptions<E> = {}) {
        options.withTrashed = options.withTrashed ?? false;
        const roots = await this.findRoots(options);
        await Promise.all(roots.map((root) => this.findDescendantsTree(root, options)));
        return roots;
    }

    /**
     * 构建后代查询器，支持自定义排序与额外查询
     * 源码中构建后代查询很复杂，必须调用suoer
     * @param closureTableAlias
     * @param entity
     * @param options
     * @returns
     */
    createDtsQueryBuilder(closureTableAlias: string, entity: E, options: QueryTreeOptions<E> = {}) {
        const { addQuery, orderBy, withTrashed } = options;
        let qb = this.buildBaseQuery(
            super.createDescendantsQueryBuilder(this.alias, closureTableAlias, entity),
        );
        qb = !isNil(addQuery) ? addQuery(qb) : qb;
        qb = !isNil(orderBy) ? getQrderByQuery(qb, this.alias, orderBy) : qb;
        qb = withTrashed ? qb.withDeleted() : qb;
        return qb;
    }

    /**
     * 构建祖先查询器，支持自定义排序与额外查询
     * 源码中构建祖先查询很复杂，必须调用suoer
     * @param closureTableAlias
     * @param entity
     * @param options
     * @returns
     */
    createAtsQueryBuilder(closureTableAlias: string, entity: E, options: QueryTreeOptions<E> = {}) {
        const { addQuery, orderBy, withTrashed } = options;
        let qb = this.buildBaseQuery(
            super.createAncestorsQueryBuilder(this.alias, closureTableAlias, entity),
        );
        qb = !isNil(addQuery) ? addQuery(qb) : qb;
        qb = !isNil(orderBy) ? getQrderByQuery(qb, this.alias, orderBy) : qb;
        qb = withTrashed ? qb.withDeleted() : qb;
        return qb;
    }

    /**
     * 查找指定entity实体的后代
     * @param entity 实体
     * @param options
     * @returns
     */
    async findDescendantsTree(entity: E, options: QueryTreeOptions<E> = {}) {
        const qb = this.createDtsQueryBuilder('treeClosure', entity, options);

        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        const entities = await qb.getRawAndEntities();
        const relationMaps = TreeRepositoryUtils.createRelationMaps(
            this.manager,
            this.metadata,
            this.alias,
            entities.raw,
        );
        TreeRepositoryUtils.buildChildrenEntityTree(
            this.metadata,
            entity,
            entities.entities,
            relationMaps,
            {
                depth: -1,
                ...options,
            },
        );
        return entity;
    }

    /**
     * 查询祖先树
     * @param entity
     * @param params
     */
    async findAncestorsTree(entity: E, options: QueryTreeOptions<E> = {}): Promise<E> {
        const qb = this.createAtsQueryBuilder('treeClosure', entity, options);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        const entities = await qb.getRawAndEntities();
        const relationMaps = TreeRepositoryUtils.createRelationMaps(
            this.manager,
            this.metadata,
            this.alias,
            entities.raw,
        );
        TreeRepositoryUtils.buildParentEntityTree(
            this.metadata,
            entity,
            entities.entities,
            relationMaps,
        );
        return entity;
    }

    /**
     * 查询entity的后代数量
     */
    countDescendants(entity: E, options: QueryTreeOptions<E> = {}): Promise<number> {
        return this.createDtsQueryBuilder('treeClosure', entity, options).getCount();
    }

    /**
     * 查询entity的祖先数量
     */
    countAncestors(entity: E, options: QueryTreeOptions<E> = {}) {
        return this.createAtsQueryBuilder('treeClosure', entity, options).getCount();
    }

    /**
     * 查询后代一维数组
     * @param entity
     * @param options
     * @returns
     */
    findDescendants(entity: E, options: QueryTreeOptions<E> = {}) {
        const qb = this.createDtsQueryBuilder('treeClosure', entity, options);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        return qb.getMany();
    }

    /**
     * 查询祖先一维数组
     * @param entity
     * @param options
     * @returns
     */
    findAncestors(entity: E, options: QueryTreeOptions<E> = {}) {
        const qb = this.createAtsQueryBuilder('treeClosure', entity, options);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        return qb.getMany();
    }

    async toFlatTrees(trees: E[], depth = 0, parent?: E | null) {
        // 展品后的树没有children字段。
        const list: Omit<E, 'children'>[] = [];
        for (const item of trees) {
            (item as any).depth = depth;
            (item as any).parent = parent;
            const { children } = item;
            // 删除children字段
            unset(item, 'children');
            list.push(item);
            // 递归以item为parent的children列表
            list.push(...(await this.toFlatTrees(children, depth + 1, item)));
        }
        return list as E[];
    }
}
