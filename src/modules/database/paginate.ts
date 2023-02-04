import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginateOptions, PaginateReturn } from '@/modules/utils';

/**
 *
 * @param qb createQueryBuilder的返回值
 * @param options
 */
export const paginate = async <E extends ObjectLiteral>(
    qb: SelectQueryBuilder<E>,
    options: PaginateOptions,
): Promise<PaginateReturn<E>> => {
    // limit - 1
    const start = options.page > 0 ? options.page - 1 : 0;
    // 查询总数
    const totalItems = await qb.getCount();
    // 分页查询
    qb = qb.take(options.limit).skip(options.limit * start);
    const items = await qb.getMany();
    // 计算总页数
    const totalPages =
        totalItems % options.limit === 0
            ? Math.floor(totalItems / options.limit)
            : Math.floor(totalItems / options.limit) + 1;
    // 最后一页剩余项
    const remainder = totalItems % options.limit !== 0 ? totalItems % options.limit : options.limit;
    const itemCount = options.page < totalPages ? options.limit : remainder;

    return {
        items,
        meta: {
            itemCount,
            totalItems,
            perPage: options.limit,
            totalPages,
            currentPage: options.page,
        },
    };
};

/**
 * 对树形数据分页
 * 树形数据需要查出来再展平，拿到的是展平的列表
 * @param options
 * @param data
 * @returns
 */
export function treePaginate<E extends ObjectLiteral>(
    options: PaginateOptions,
    data: E[],
): PaginateReturn<E> {
    let items: E[] = [];
    // 当前页的数据
    const { page, limit } = options;
    // 所有数据个数
    const totalItems = data.length;
    // 带小数点的页数
    const totalRst = totalItems / limit;
    const totalPages =
        totalRst > Math.floor(totalRst) ? Math.floor(totalRst) + 1 : Math.floor(totalRst);
    // 当前页个数
    let itemCount = 0;
    if (page <= totalPages) {
        // 如果是最后一页，扣掉前几页的总数
        itemCount = page === totalPages ? totalItems - (totalPages - 1) * limit : limit;
        const start = (page - 1) * limit;
        items = data.slice(start, start + itemCount);
    }

    return {
        items,
        meta: {
            totalItems,
            totalPages,
            itemCount,
            currentPage: page,
            perPage: limit,
        },
    };
}
