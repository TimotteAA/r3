import { BaseTreeRepository } from '@/modules/core/crud/tree.repository';
import { CategoryEntity } from '../entities';
import { OrderType } from '@/modules/core/types';
import { CustomRepository } from '@/modules/database/decorators';
import { SelectQueryBuilder } from 'typeorm';

@CustomRepository(CategoryEntity)
export class CategoryRepository extends BaseTreeRepository<CategoryEntity> {
    // 查询名
    protected alias = 'category';

    protected orderBy = {
        name: 'customOrder',
        order: OrderType.DESC,
    };

    buildBaseQuery(qb: SelectQueryBuilder<CategoryEntity>): SelectQueryBuilder<CategoryEntity> {
        return qb.leftJoinAndSelect(`${this.alias}.parent`, 'parent');
    }
}
