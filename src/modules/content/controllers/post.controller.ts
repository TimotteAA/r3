import { Param, Body, Controller, Post, Patch, Delete, Get, Query, SerializeOptions, ParseUUIDPipe } from '@nestjs/common';
import { omit, isNil } from 'lodash';
import { In, Not, IsNull } from 'typeorm';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { PostService } from '../services/post.service';
import { CreatePostDto, QueryPostDto, UpdatePostDto} from '../dtos';
import { User } from '@/modules/user/decorators';
import { UserEntity } from '@/modules/user/entities';
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { PostEntity } from '../entities';
import { Permission } from '@/modules/rbac/decorators';
import { checkOwner } from '@/modules/rbac/helpers';
import { PostRepository } from '../repositorys';
import { DeleteDto } from '@/modules/restful/dto';
import { QueryTrashMode } from '@/modules/database/constants';
import { QueryHook } from '@/modules/database/types';
import { ContentModule } from '../content.module';
import { Depends } from '@/modules/restful/decorators';

const checkers: Record<"create" | "owner", PermissionChecker> = {
    create: async (ab) => ab.can(PermissionAction.CREATE, PostEntity.name),
    owner: async (ab, ref, request) => checkOwner(ab,
        async (ids) => 
            ref.get(PostRepository, { strict: false }).find({
                where: {
                    id: In(ids)
                },
                relations: ['author']
            }),
        request
    )
}

@ApiTags("前台文章api")
@Depends(ContentModule)
@Controller('api/posts')
export class PostController {
    public constructor(protected service: PostService) {}

    @ApiOperation({
        summary: "查询文章列表"
    })
    @Get()
    @SerializeOptions({groups: ['post-list']})
    async list(
        @Query() data: QueryPostDto,
        @User() user: ClassToPlain<UserEntity>
    ) {
        data.trashed = QueryTrashMode.NONE;
        return this.service.paginate(
            omit(data, ['author', 'isPublished']),
            queryListCallback(data, user)
        )
    }

    @ApiOperation({
        summary: "查询文章详情"
    })
    @Get(':id')
    @SerializeOptions({ groups: ['post-detail'] })
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @User() author: ClassToPlain<UserEntity>,
    ) {
        return this.service.detail(id, false, queryItemCallback(author));
    }

    // 重写create方法，传入用户id
    @ApiOperation({
        summary: "发表文章"
    })
    @Post()
    @SerializeOptions({groups: ['post-detail']})
    @Permission(checkers.create)
    async create(@Body() data: CreatePostDto, @User() user: ClassToPlain<UserEntity>) {
        return this.service.create({ ...data, customOrder: 0 }, user.id)
    }

    @ApiOperation({
        summary: "更新文章"
    })
    @Patch()
    @SerializeOptions({groups: ['post-detail']})
    @Permission(checkers.owner)
    async update(@Body() data: UpdatePostDto) {
        return this.service.update(data);
    }

    @ApiOperation({
        summary: "删除文章，支持批量删除"
    })
    @Delete()
    @SerializeOptions({ groups: ['post-detail'] })
    @Permission(checkers.owner)
    async delete(
        @Body()
        { ids }: DeleteDto
    ) {
        return this.service.delete(ids, false);
    }
}

const queryPublished = (isPublished?: boolean) => {
    if (typeof isPublished === 'boolean') {
        return isPublished ? { publishedAt: Not(IsNull()) } : { publishedAt: IsNull() };
    }
    return {};
};

const queryListCallback: (
    options: QueryPostDto,
    author: ClassToPlain<UserEntity>,
) => QueryHook<PostEntity> = (options, author) => async (qb) => {
    // console.log("author", author)
    if (!isNil(author)) {
        if (isNil(options.author)) {
            // 没有指定查询的用户：自己的所有文章与别人发布的文章
            return qb
                .where({ author: author.id, ...queryPublished(options.isPublished) })
                .orWhere({ publishedAt: Not(IsNull()) });
        }
        // 指定了文章的作者id
        return qb.where({
            author: options.author,
            ...queryPublished(options.isPublished)
        })
    }
    // 未登录
    return qb.where({ publishedAt: Not(IsNull()) });
};

/**
 * 在查询文章详情时,只有自己才能查看自己未发布的文章
 * @param author
 */
const queryItemCallback: (author: ClassToPlain<UserEntity>) => QueryHook<PostEntity> =
    (author) => async (qb) => {
        // 没有指定作者
        if (!isNil(author)) {
            return qb.andWhere({ 'author.id': author.id }).orWhere({ publishedAt: Not(IsNull()) });
        }
        return qb.andWhere({ publishedAt: Not(IsNull()) });
    };
