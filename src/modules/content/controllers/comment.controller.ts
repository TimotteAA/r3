import { Controller, Get, SerializeOptions, Query } from '@nestjs/common';
import { CommentService } from '../services';
import { QueryCommentDto, QueryCommentTreeDto, CreateCommentDto } from '../dtos';
import { BaseController } from '@/modules/core/crud';
import { Crud } from '@/modules/core/decorators';

@Controller('comments')
@Crud({
    id: 'comment',
    enabled: [
        {
            name: 'list',
            options: { allowGuest: true },
        },
        {
            name: 'detail',
            options: { allowGuest: true },
        },
        'create',
        'delete',
    ],
    dtos: {
        query: QueryCommentDto,
        create: CreateCommentDto,
        update: null,
    },
})
export class CommentController extends BaseController<CommentService> {
    constructor(protected commentService: CommentService) {
        super(commentService);
    }

    /**
     * 获取某篇文章的评论树
     * @param options
     */
    @SerializeOptions({ groups: ['comment-tree'] })
    @Get('tree')
    async tree(
        @Query()
        options: QueryCommentTreeDto,
    ) {
        return this.commentService.findTrees(options);
    }
}
