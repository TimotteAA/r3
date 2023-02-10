import { Controller, Get, Post, SerializeOptions, Query, Body, Delete} from '@nestjs/common';
import { CommentService } from '../services';
import { ApiQueryCategoryDto, QueryCommentTreeDto, CreateCommentDto } from '../dtos';
import { GUEST, User } from '@/modules/user/decorators';
import { ClassToPlain } from '@/modules/utils';
import { UserEntity } from '@/modules/user/entities';
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { CommentEntity } from '../entities';
import { Permission } from '@/modules/rbac/decorators';
import { checkOwner } from '@/modules/rbac/helpers';
import { CommentRepository } from '../repositorys';
import { In } from 'typeorm';
import { DeleteDto } from '@/modules/restful/dto';

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

@Controller('api/comments')
export class CommentController {
    constructor(protected commentService: CommentService) {}

    /**
     * 获取某篇文章的评论树
     * @param options
     */
    @SerializeOptions({ groups: ['comment-tree'] })
    @Get('tree')
    @GUEST()
    async tree(
        @Query()
        options: QueryCommentTreeDto,
    ) {
        return this.commentService.findTrees(options);
    }

    @SerializeOptions({groups: ['comment-list']})
    @Get()
    @GUEST()
    async list(
        @Query()
        options: ApiQueryCategoryDto
    ) {
        return this.commentService.paginate(options);
    }

    @Permission(permission.create)
    @Post()
    async create(@Body() data: CreateCommentDto, @User() user: ClassToPlain<UserEntity>) {
        return this.commentService.create(data, user.id)
    }

    @Permission(permission.delete)
    @Delete()
    async delete(
        @Body()
        { ids }: DeleteDto
    ) {
        return this.commentService.delete(ids, false);
    }
}
