import { PostEntity } from '@/modules/content/entities/post.entity';
import { CustomRepository } from '@/modules/database/decorators/custom.repository';
import { CommentEntity } from '../entities';
import { BaseRepository } from '@/modules/core/crud/repository';

@CustomRepository(PostEntity)
export class PostRepository extends BaseRepository<PostEntity> {
    buildBaseQuery() {
        return this.createQueryBuilder('post')
            .leftJoinAndSelect('post.categories', 'categories')
            .addSelect((subQuery) => {
                return subQuery
                    .select('COUNT(c.id)', 'count')
                    .from(CommentEntity, 'c')
                    .where('c.post.id = post.id');
            }, 'commentCount')
            .loadRelationCountAndMap('post.commentCount', 'post.comments');
    }
}
