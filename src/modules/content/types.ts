import { SelectQueryBuilder, FindTreeOptions } from 'typeorm';
import { CommentEntity } from './entities';

export type FindCommentTreeOptions = FindTreeOptions & {
    addQuery?: (query: SelectQueryBuilder<CommentEntity>) => SelectQueryBuilder<CommentEntity>;
};
