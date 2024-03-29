import { Controller, Get, Post, SerializeOptions, Query, Body, Delete} from '@nestjs/common';
import { CommentService } from '../services';
import { ApiQueryCategoryDto, QueryCommentTreeDto, CreateCommentDto } from '../dtos';
import { GUEST, User } from '@/modules/user/decorators';
import { UserEntity } from '@/modules/user/entities';
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { CommentEntity } from '../entities';
import { Permission } from '@/modules/rbac/decorators';
import { checkOwner } from '@/modules/rbac/helpers';
import { CommentRepository } from '../repositorys';
import { In } from 'typeorm';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeleteDto } from '@/modules/restful/dto';
import { Depends } from '@/modules/restful/decorators';
import { ContentModule } from '../content.module';

const permission: Record<"create" | "delete", PermissionChecker> = {
    create: async (ab) => ab.can(PermissionAction.CREATE, CommentEntity.name),
    delete: async (ab, ref, request) => checkOwner(ab, 
        async (ids) => 
            ref.get(CommentRepository, {strict: false}).find({
                relations: ['author'],
                where: {
                    id: In(ids)
                }
            }),
        request
    )
}

@ApiTags("评论操作")
@Depends(ContentModule)
@Controller('comments')
export class CommentController {
    constructor(protected commentService: CommentService) {}

    /**
     * 获取某篇文章的评论树
     * @param options
     */
    @ApiOperation({
        summary: "查询评论树，可以查询某篇文章的评论"
    })
    @SerializeOptions({ groups: ['comment-tree'] })
    @Get('tree')
    @GUEST()
    async tree(
        @Query()
        options: QueryCommentTreeDto,
    ) {
        console.log("comment tree")
        return this.commentService.findTrees(options);
    }

    @ApiOperation({
        summary: "查询评论树，可以查询某篇文章、某个用户的评论"
    })
    @SerializeOptions({groups: ['comment-list']})
    @Get()
    @GUEST()
    async list(
        @Query()
        options: ApiQueryCategoryDto
    ) {
        console.log("commentsasdadasd")
        return this.commentService.paginate(options);
    }

    @ApiOperation({
        summary: "创建新的评论"
    })
    @Permission(permission.create)
    @Post()
    async create(@Body() data: CreateCommentDto, @User() user: ClassToPlain<UserEntity>) {
        return this.commentService.create(data, user.id)
    }

    @ApiOperation({
        summary: "删除评论，支持批量删除"
    })
    @Permission(permission.delete)
    @Delete()
    async delete(
        @Body()
        { ids }: DeleteDto
    ) {
        return this.commentService.delete(ids, false);
    }
}
