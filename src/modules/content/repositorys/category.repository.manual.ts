import { TreeRepository, FindTreeOptions, FindOptionsUtils } from 'typeorm';
import { CustomRepository } from '@/modules/database/decorators';
import { CategoryEntity } from '@/modules/content/entities';
import { unset } from 'lodash';

@CustomRepository(CategoryEntity)
export class CategoryRepository extends TreeRepository<CategoryEntity> {
    /**
     * 构建基础查询器，可以查询父类
     * @returns
     */
    protected buildBasicQuery() {
        return this.createQueryBuilder('category').leftJoinAndSelect('category.parent', 'parent');
    }

    /**a
     * 查询顶级分类
     * @param options：深度与关联关系
     * @returns
     */
    findRoots(options?: FindTreeOptions) {
        // alias表的别名
        const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);
        const joinColumn = this.metadata.treeParentRelation.joinColumns[0];
        const parentPropertyName = joinColumn.givenDatabaseName || joinColumn.databaseName;
        // 使用自定义的基本查询器，可以查询parent，并支持自定义排序
        const qb = this.buildBasicQuery().orderBy('category.customOrder', 'ASC');
        qb.where(`${escapeAlias('category')}.${escapeColumn(parentPropertyName)} IS NULL`);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        return qb.getMany();
    }

    /**
     * 构建后代查询器，支持自定义排序
     * @param alias
     * @param closureTableAlias
     * @param entity
     * @returns
     */
    createDescendantsQueryBuilder(
        alias: string,
        closureTableAlias: string,
        entity: CategoryEntity,
    ) {
        return super
            .createDescendantsQueryBuilder(alias, closureTableAlias, entity)
            .orderBy(`${alias}.customOrder`, 'ASC');
    }

    /**
     * 创建祖先查询器
     * @param alias
     * @param closureTableAlias
     * @param entity
     */
    createAncestorsQueryBuilder(alias: string, closureTableAlias: string, entity: CategoryEntity) {
        return super
            .createAncestorsQueryBuilder(alias, closureTableAlias, entity)
            .orderBy(`${alias}.customOrder`, 'ASC');
    }

    async toFlatTrees(trees: CategoryEntity[], depth = 0, parent?: CategoryEntity | null) {
        // 展品后的树没有children字段。
        const list: Omit<CategoryEntity, 'children'>[] = [];
        for (const item of trees) {
            item.depth = depth;
            item.parent = parent;
            const { children } = item;
            // 删除children字段
            unset(item, 'children');
            list.push(item);
            // 递归以item为parent的children列表
            list.push(...(await this.toFlatTrees(children, depth + 1, item)));
        }
        return list as CategoryEntity[];
    }
}
