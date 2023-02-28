import { PostEntity } from '@/modules/content/entities/post.entity';
import { CustomRepository } from '@/modules/database/decorators/custom.repository';
import { CommentEntity } from '../entities';
import { BaseRepository } from '@/modules/database/crud/repository';
import { ActionEntity } from '@/modules/actions/entities';
// import { SelectQueryBuilder } from 'typeorm';
// import { TypeAction, TypeStuff } from '@/modules/actions/constants';

@CustomRepository(PostEntity)
export class PostRepository extends BaseRepository<PostEntity> {
    protected alias = 'post';

    buildBaseQuery() {
        return this.createQueryBuilder('post')
            .leftJoinAndSelect('post.categories', 'categories')
            .leftJoinAndSelect("post.author", "author")
            .addSelect((subQuery) => {
                return subQuery
                    .select('COUNT(c.id)', 'count')
                    .from(CommentEntity, 'c')
                    .where('c.post.id = post.id');
            }, 'commentCount')
            .loadRelationCountAndMap('post.commentCount', 'post.comments')
            .leftJoinAndSelect(ActionEntity, "actions", "actions.actionType");
    }
}
