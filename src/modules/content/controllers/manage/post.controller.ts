import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PostService } from '../../services/post.service';
import { QueryPostDto } from '../../dtos';
import { ManageCreatePostDto, ManageUpdatePostDto } from '../../dtos/manage/post.dto';
import { Crud } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { User } from '@/modules/user/decorators';
import { UserEntity } from '@/modules/user/entities';
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { PostEntity } from '../../entities';
import { simpleCrudOptions } from '@/modules/rbac/helpers';
import { Permission } from '@/modules/rbac/decorators';
import { Depends } from '@/modules/restful/decorators';
import { ContentModule } from '../../content.module';


// 文章的后台管理权限
const permissions: PermissionChecker[] = [
    async ab => ab.can(PermissionAction.MANAGE, PostEntity.name)
]

@ApiTags("文章管理")
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(() => ({
    id: 'post',
    enabled: [
        { name: "list", options: simpleCrudOptions(permissions, "文章分页查询") },
        { name: "detail", options: simpleCrudOptions(permissions, "查看文章详情") },
        { name: "create", options: simpleCrudOptions(permissions, "创建文章") },
        { name: "update", options: simpleCrudOptions(permissions, "更新文章") },
        { name: "delete", options: simpleCrudOptions(permissions, "删除文章，支持批量删除") },
        { name: "restore", options: simpleCrudOptions(permissions, "恢复软删除文章，支持批量恢复")}
    ],
    dtos: {
        query: QueryPostDto,
        create: ManageCreatePostDto,
        update: ManageUpdatePostDto,
    },
}))
@Controller('posts')
export class PostController extends BaseController<PostService> {
    public constructor(protected service: PostService) {
        super(service);
    }

    // 重写create方法，传入用户id
    @ApiOperation({
        summary: "发表文章"
    })
    @Permission(...permissions)
    @Post()
    async create(@Body() data: ManageCreatePostDto, @User() user: ClassToPlain<UserEntity>) {
        return this.service.create(data, user.id)
    }
}
