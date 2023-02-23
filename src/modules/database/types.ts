import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { OneToMany, OneToOne, ManyToOne, ManyToMany, SelectQueryBuilder, ObjectLiteral, FindTreeOptions } from "typeorm"
import { OrderType, QueryTrashMode } from './constants';

/**
 * 关联关系动态关联装饰器工厂函数入参
 */
export interface DynamicRelation {
  // 关联关系
  relation: ReturnType<typeof OneToOne> | ReturnType<typeof OneToMany> | ReturnType<typeof ManyToOne> | ReturnType<typeof ManyToMany>;
  // 别的装饰器？
  others?: Array<(...args: any[]) => any>;
  // 字段
  column: string;
}

/**
 * 为queryBuilder添加查询的回调函数接口
 */
export type QueryHook<Entity> = (
  qb: SelectQueryBuilder<Entity>,
) => Promise<SelectQueryBuilder<Entity>>;

/**
* 分页原数据
*/
export interface PaginateMeta {
  /**
   * 当前页项目数量
   */
  itemCount: number;
  /**
   * 项目总数量
   */
  totalItems?: number;
  /**
   * 每页显示数量
   */
  perPage: number;
  /**
   * 总页数
   */
  totalPages?: number;
  /**
   * 当前页数
   */
  currentPage: number;
}
/**
* 分页选项
*/
export interface PaginateOptions {
  /**
   * 当前页数
   */
  page: number;
  /**
   * 每页显示数量
   */
  limit: number;
}

/**
* 分页返回数据的类型
*/
export interface PaginateReturn<E extends ObjectLiteral> {
  meta: PaginateMeta;
  items: E[];
}


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
 * 自定义数据库配置
 */
export type DbConfigOptions = {
    /**
     * 多个数据库连接的公共配置：字符集、日志
     */
    common: Record<string, any>
    /**
     * 各个数据库链接配置
     */
    connections: Array<TypeOrmModuleOptions>;
}

/**
 * 利用typeorm注册配置
 */
export type TypeormOption = Omit<TypeOrmModuleOptions, 'name' | 'migrations'> & {
    name: string
}

/**
 * 最终数据库配置（hook加工后）
 */
export type DbConfig = Record<string, any> & {
    common: Record<string, any>;
    connections: TypeormOption[];
}

