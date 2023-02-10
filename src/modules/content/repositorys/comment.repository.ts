import { BaseTreeRepository } from '@/modules/core/crud/tree.repository';
import { CommentEntity } from '../entities';
import { CustomRepository } from '@/modules/database/decorators';
import { QueryTreeOptions } from '@/modules/core/types';
import { SelectQueryBuilder } from 'typeorm';
import { TreeChildrenResolve } from '@/modules/core/constants';

@CustomRepository(CommentEntity)
export class CommentRepository extends BaseTreeRepository<CommentEntity> {
    protected alias = 'comment';

    protected _childrenResolve = TreeChildrenResolve.DELETE;

    buildBaseQuery(qb: SelectQueryBuilder<CommentEntity>): SelectQueryBuilder<CommentEntity> {
        return qb
            .leftJoinAndSelect(`${this.alias}.parent`, 'parent')
            .leftJoinAndSelect(`${this.getAlias()}.post`, 'post')
            .leftJoinAndSelect(`${this.getAlias()}.author`, 'author')
            .orderBy(`${this.alias}.createdAt`, 'ASC');
    }

    /**
     * 重写了findTrees，支持查找某一文章的评论树
     * @param options
     * @returns
     */
    async findTrees(
        options: QueryTreeOptions<CommentEntity>,
    ): Promise<CommentEntity[]> {   
        return super.findTrees(options)
    }
}
