
import { isNil } from 'lodash';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { OrderQueryType } from '@/modules/utils';
import deepmerge from 'deepmerge';


/**
 * content模块
 */


export function getQrderByQuery<E extends ObjectLiteral>(
    qb: SelectQueryBuilder<E>,
    alias: string,
    orderBy?: OrderQueryType,
): SelectQueryBuilder<E> {
    if (isNil(orderBy)) return qb;
    if (typeof orderBy === 'string') {
        return qb.orderBy(`${alias}.${orderBy}`, 'DESC');
    }
    if (Array.isArray(orderBy)) {
        let i = 0;

        for (const item of orderBy) {
            // 第一个orderBy
            if (i === 0) {
                qb =
                    typeof item === 'string'
                        ? qb.orderBy(`${alias}.${item}`, 'DESC')
                        : qb.orderBy(`${alias}.${item.name}`, `${item.order}`);
                i++;
            } else {
                qb =
                    typeof item === 'string'
                        ? qb.addOrderBy(`${alias}.${item}`, 'DESC')
                        : qb.addOrderBy(`${alias}.${item.name}`, `${item.order}`);
            }
        }
        return qb;
    }
    return qb.orderBy(`${alias}.${orderBy.name}`, `${orderBy.order}`);
}

/**
 * 深度合并对象
 * @param x 初始值
 * @param y 新值
 * @param arrayMode 对于数组采取的策略,`replace`为直接替换,`merge`为合并数组
 */
export const deepMerge = <T1, T2>(
    x: Partial<T1>,
    y: Partial<T2>,
    arrayMode: 'replace' | 'merge' = 'merge',
) => {
    const options: deepmerge.Options = {};
    if (arrayMode === 'replace') {
        options.arrayMerge = (_d, s, _o) => s;
    } else if (arrayMode === 'merge') {
        options.arrayMerge = (_d, s, _o) => Array.from(new Set([..._d, ...s]));
    }
    return deepmerge(x, y, options) as T2 extends T1 ? T1 : T1 & T2;
};


/**
 * 生成随机验证码
 */
export function generateCatpchaCode() {
    return Math.random().toFixed(6).slice(-6);
}

