import { SelectQueryBuilder } from 'typeorm';

import { OrderType, TreeChildrenResolve } from '@/modules/database/constants';
import { BaseTreeRepository } from '@/modules/database/crud/tree.repository';

import { CustomRepository } from '@/modules/database/decorators';

import { CategoryEntity } from '../entities';

@CustomRepository(CategoryEntity)
export class CategoryRepository extends BaseTreeRepository<CategoryEntity> {
    // 查询名
    protected alias = 'category';

    protected _childrenResolve = TreeChildrenResolve.UP;

    protected orderBy = {
        name: 'customOrder',
        order: OrderType.DESC,
    };

    buildBaseQuery(qb: SelectQueryBuilder<CategoryEntity>): SelectQueryBuilder<CategoryEntity> {
        return qb
            .leftJoinAndSelect(`${this.alias}.parent`, 'parent')
            .loadRelationCountAndMap('category.postsCount', 'category.posts');
    }
}
