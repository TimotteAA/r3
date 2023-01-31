import { BaseTreeRepository } from '@/modules/core/crud/tree.repository';
import { CommentEntity } from '../entities';
import { CustomRepository } from '@/modules/database/decorators';
import { QueryTreeOptions } from '@/modules/utils';
import { isNil } from 'lodash';
import { SelectQueryBuilder } from 'typeorm';

@CustomRepository(CommentEntity)
export class CommentRepository extends BaseTreeRepository<CommentEntity> {
    protected alias = 'comment';

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
        options: QueryTreeOptions<CommentEntity> & { post?: string },
    ): Promise<CommentEntity[]> {
        return super.findTrees({
            ...options,
            addQuery: (qb: SelectQueryBuilder<CommentEntity>) =>
                isNil(options.post) ? qb : qb.where('post.id = :id', { id: options.post }),
        });
    }
}
