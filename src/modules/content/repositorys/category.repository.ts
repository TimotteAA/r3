import { BaseTreeRepository } from '@/modules/core/crud/tree.repository';
import { CategoryEntity } from '../entities';
import { OrderType } from '@/modules/core/constants';
import { CustomRepository } from '@/modules/database/decorators';
import { SelectQueryBuilder } from 'typeorm';
import { TreeChildrenResolve } from "@/modules/core/constants";

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
        // .addSelect((subQuery) => {
        //     return subQuery
        //         .select('COUNT(c.id)', 'count')
        //         .from(CategoryEntity, 'c')
        //         .leftJoinAndSelect("category.posts", "posts")
        //         .where('c.post.id = post.id');
        // }, 'commentCount')
        // .loadRelationCountAndMap('post.commentCount', 'post.comments');
    }
}
