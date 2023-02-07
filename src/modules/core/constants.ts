export const CUSTOM_DTO_VALIDATION_KEY = 'CUSTOM_DTO_VALIDATION_KEY';
export const CRUD_OPTIONS = 'CRUD_OPTIONS';
export const ALLOW_GUEST = 'ALLOW_GUEST';

/**
 * crud相关的类型
 */

export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
* 软删除数据查询类型
*/
export enum QueryTrashMode {
  ALL = 'all', // 包含已软删除和未软删除的数据
  ONLY = 'only', // 只包含软删除的数据
  NONE = 'none', // 只包含未软删除的数据
}

/**
 * 树形模型在删除父级后子级的处理方式
 */
export enum TreeChildrenResolve {
  DELETE = 'delete',
  UP = 'up',
  ROOT = 'root',
}