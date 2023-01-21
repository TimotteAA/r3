import { TreeRepository, FindOptionsUtils, SelectQueryBuilder, TreeRepositoryUtils } from 'typeorm';
import { CustomRepository } from '@/modules/database/decorators';
import { CommentEntity } from '@/modules/content/entities';
import { unset } from 'lodash';
import { FindCommentTreeOptions } from '../types';

@CustomRepository(CommentEntity)
export class CommentRepository extends TreeRepository<CommentEntity> {
    /**
     * 构建基础查询器，关联父类与文章，并且按创建时间排序
     * @returns
     */
    protected buildBasicQuery(qb: SelectQueryBuilder<CommentEntity>) {
        return qb
            .leftJoinAndSelect('comment.parent', 'parent')
            .leftJoinAndSelect('comment.post', 'post')
            .orderBy('comment.createdAt', 'ASC');
    }

    /**
     * 查询树
     * @param options
     * @returns
     */
    async findTrees(options: FindCommentTreeOptions = {}) {
        // 查询时的关联关系
        options.relations = ['parent', 'children'];
        const roots = await this.findRoots(options);
        await Promise.all(roots.map((root) => this.findDescendantsTree(root, options)));
        return roots;
    }

    /**
     * 查询顶级评论，可以加入额外的参数
     * @param options
     * @returns
     */
    findRoots(options?: FindCommentTreeOptions) {
        const { addQuery, ...rest } = options;
        const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);
        const joinColumn = this.metadata.treeParentRelation.joinColumns[0];
        const parentPropertyName = joinColumn.givenDatabaseName || joinColumn.databaseName;
        // 使用自定义的基本查询器
        let qb = this.buildBasicQuery(this.createQueryBuilder('comment'));
        qb.where(`${escapeAlias('comment')}.${escapeColumn(parentPropertyName)} IS NULL`);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, rest);
        qb = addQuery ? addQuery(qb) : qb;
        return qb.getMany();
    }

    /**
     * 创建后代查询器，从而可以进行额外的查询
     * @param closureTableAlias
     * @param entity
     * @param options
     */
    createDtsQueryBuilder(
        closureTableAlias: string,
        entity: CommentEntity,
        options: FindCommentTreeOptions = {},
    ): SelectQueryBuilder<CommentEntity> {
        const { addQuery } = options;
        // 对原生的后代查询器进行增强
        const qb = this.buildBasicQuery(
            super.createDescendantsQueryBuilder('comment', closureTableAlias, entity),
        );
        return addQuery ? addQuery(qb) : qb;
    }

    async findDescendantsTree(entity: CommentEntity, options: FindCommentTreeOptions = {}) {
        const qb = this.createDtsQueryBuilder('treeClosure', entity, options);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        const entities = await qb.getRawAndEntities();
        const relationMaps = TreeRepositoryUtils.createRelationMaps(
            this.manager,
            this.metadata,
            'comment',
            entities.raw,
        );
        TreeRepositoryUtils.buildChildrenEntityTree(
            this.metadata,
            entity,
            entities.entities,
            relationMaps,
            {
                depth: -1,
                ...options,
            },
        );
        return entity;
    }

    async toFlatTrees(trees: CommentEntity[], depth = 0, parent?: CommentEntity | null) {
        // 展品后的树没有children字段。
        const list: Omit<CommentEntity, 'children'>[] = [];
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
        return list as CommentEntity[];
    }
}
