import {
    Controller,
    Get,
    Post,
    Delete,
    SerializeOptions,
    Body,
    Param,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import { CommentService } from '../services';
import { QueryCommentDto, QueryCommentTreeDto, CreateCommentDto } from '../dtos';

@Controller('comments')
export class CommentController {
    constructor(private commentService: CommentService) {}

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

    @SerializeOptions({ groups: ['comment-list'] })
    @Get()
    async list(
        @Query()
        options: QueryCommentDto,
    ) {
        return this.commentService.paginate(options);
    }

    @SerializeOptions({ groups: ['comment-detail'] })
    @Post()
    async create(
        @Body()
        data: CreateCommentDto,
    ) {
        return this.commentService.create(data);
    }

    // @SerializeOptions({groups: ['comment-detail']})
    // @Patch()
    // async update(@Body(
    //   new ValidationPipe({
    //     transform: true,
    //     forbidUnknownValues: true,
    //     validationError: { target: false },
    // }) )data: UpdateCategoryDto) {
    //   return this.commentService.update(data);
    // }

    @SerializeOptions({ groups: ['comment-detail'] })
    @Delete()
    async delete(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.commentService.delete(id);
    }
}
