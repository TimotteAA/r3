import { SelectQueryBuilder, ObjectLiteral, FindTreeOptions } from 'typeorm';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { OrderType, QueryTrashMode } from './constants';

/**
 * 排序类型,{字段名称: 排序升序或降序}
 * 如果多个值则传入数组即可
 * 排序方法不设置,默认DESC
 */
export type OrderQueryType =
    | string
    | { name: string; order: `${OrderType}` }
    | Array<{ name: string; order: `${OrderType}` } | string>;

/**
 * 树形数据查询
 */
export type QueryTreeOptions<E extends ObjectLiteral> = FindTreeOptions & {
    addQuery?: (qb: SelectQueryBuilder<E>) => SelectQueryBuilder<E>;
    orderBy?: OrderQueryType;
    withTrashed?: boolean;
};

/**
 * 列表数据查询类型
 */
export interface QueryParams<E extends ObjectLiteral> {
    addQuery?: (qb: SelectQueryBuilder<E>) => SelectQueryBuilder<E>;
    orderBy?: OrderQueryType;
    withTrashed?: boolean;
}


/**
 * 列表查询
 */
export type QueryListParams<E extends ObjectLiteral> = Omit<QueryTreeOptions<E>, 'withTrashed'> & {
    trashed?: `${QueryTrashMode}`;
};

/**
 * 软删除dto
 */
export interface TrashedDto {
    trashed?: QueryTrashMode;
}

/**
 * 所有的controller方法
 */
export type CurdMethod =
    | 'list'
    | 'detail'
    | 'delete'
    | 'deleteMulti'
    | 'restore'
    | 'restoreMulti'
    | 'create'
    | 'update';

/**
 * 路由方法的配置项
 */
export interface CurdMethodOptions {
    /**
     * 路由是否允许匿名访问
     */
    allowGuest?: boolean;
    /**
     * 路由方法的序列化选项，noGroup不传参，否则根据'id'+方法匹配来传参
     */
    serialize?: ClassTransformOptions | 'noGroup';
}

export interface CurdItem {
    name: CurdMethod;
    options?: CurdMethodOptions;
}

export interface CurdOptions {
    id: string;
    /**
     * 启用的路由方法
     */
    enabled: Array<CurdMethod | CurdItem>;
    /**
     * 列表查询、创建、更新的Dto
     */
    dtos: {
        [key in 'query' | 'create' | 'update']: any;
    };
}
