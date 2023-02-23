import { BaseTreeRepository } from '@/modules/database/crud/tree.repository';
import { CategoryEntity } from '../entities';
import { OrderType } from '@/modules/database/constants';
import { CustomRepository } from '@/modules/database/decorators';
import { SelectQueryBuilder } from 'typeorm';
import { TreeChildrenResolve } from "@/modules/database/constants";

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
        return qb.leftJoinAndSelect(`${this.alias}.parent`, 'parent')
        .loadRelationCountAndMap('category.postsCount', 'category.posts');
    }
}
