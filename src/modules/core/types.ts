import { SelectQueryBuilder, ObjectLiteral, FindTreeOptions } from 'typeorm';
import { OrderType, QueryTrashMode } from './constants';
import { PutObjectParams } from 'cos-nodejs-sdk-v5';

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
 * 树形数据表查询参数
 */
export type TreeQueryParams<E extends ObjectLiteral> = FindTreeOptions & QueryParams<E>;

/**
 * 服务类数据列表查询类型
 */
export type ServiceListQueryParams<E extends ObjectLiteral> =
    | ServiceListQueryParamsWithTrashed<E>
    | ServiceListQueryParamsNotWithTrashed<E>;

/**
 * 带有软删除的服务类数据列表查询类型
 */
type ServiceListQueryParamsWithTrashed<E extends ObjectLiteral> = Omit<
    TreeQueryParams<E>,
    'withTrashed'
> & {
    trashed?: `${QueryTrashMode}`;
} & Record<string, any>;

/**
 * 不带软删除的服务类数据列表查询类型
 */
type ServiceListQueryParamsNotWithTrashed<E extends ObjectLiteral> = Omit<
    ServiceListQueryParamsWithTrashed<E>,
    'trashed'
>;

/**
 * 软删除dto
 */
export interface TrashedDto {
    trashed?: QueryTrashMode;
}



/**
 * cos简单上传参数
 */
export type SimpleUploadParams = Omit<PutObjectParams, "Bucket" | "Region" | "Key" | "StorageClass" | "Body" | "ContentEncoding">
