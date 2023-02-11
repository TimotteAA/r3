import { Body, Controller, Post } from '@nestjs/common';
import { PostService } from '../../services/post.service';
import { QueryPostDto } from '../../dtos';
import { ManageCreatePostDto, ManageUpdatePostDto } from '../../dtos/manage/post.dto';
import { BaseController } from '@/modules/core/crud';
import { Crud } from '@/modules/core/decorators';
import { User } from '@/modules/user/decorators';
import { ClassToPlain } from '@/modules/utils';
import { UserEntity } from '@/modules/user/entities';
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { PostEntity } from '../../entities';
import { simpleCrudOptions } from '@/modules/rbac/helpers';
import { Permission } from '@/modules/rbac/decorators';

// 文章的后台管理权限
const permissions: PermissionChecker[] = [
    async ab => ab.can(PermissionAction.MANAGE, PostEntity.name)
]

@Crud({
    id: 'post',
    enabled: [
        { name: "list", options: simpleCrudOptions(permissions) },
        { name: "detail", options: simpleCrudOptions(permissions) },
        { name: "create", options: simpleCrudOptions(permissions) },
        { name: "update", options: simpleCrudOptions(permissions) },
        { name: "delete", options: simpleCrudOptions(permissions) },
        { name: "restore", options: simpleCrudOptions(permissions) }
    ],
    dtos: {
        query: QueryPostDto,
        create: ManageCreatePostDto,
        update: ManageUpdatePostDto,
    },
})
@Controller('posts')
export class PostController extends BaseController<PostService> {
    public constructor(protected service: PostService) {
        super(service);
    }

    // 重写create方法，传入用户id
    @Permission(...permissions)
    @Post()
    async create(@Body() data: ManageCreatePostDto, @User() user: ClassToPlain<UserEntity>) {
        return this.service.create(data, user.id)
    }
}
