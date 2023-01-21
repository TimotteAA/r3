import {
    ObjectLiteral,
    Repository,
    EntityTarget,
    EntityManager,
    QueryRunner,
    SelectQueryBuilder,
} from 'typeorm';
import { getQrderByQuery } from '@/modules/content/helpers';
import { OrderQueryType } from '../types';
import { isNil } from 'lodash';

/**
 * buildBasicQuery -> buildListQuery -> paginate分页数据
 */
export class BaseRepository<E extends ObjectLiteral> extends Repository<E> {
    /**
     * query-builder中的alias的名称
     */
    protected alias: string;

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
     * 构建基础查询器，可以重写，后续的分页查询都是用这个qb
     */
    buildBaseQuery() {
        return this.createQueryBuilder(this.alias);
    }

    /**
     * 对查询器排序
     */
    protected getOrderByQuery(qb: SelectQueryBuilder<E>, orderBy?: OrderQueryType) {
        const order = orderBy ?? this.orderBy;
        return !isNil(order) ? getQrderByQuery(qb, this.alias, order) : qb;
    }
}
