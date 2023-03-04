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
import { PermissionAction, ApiActionType } from '@/modules/rbac/constants';
import { PostEntity } from '../../entities';
import { simpleCrudOptions } from '@/modules/rbac/helpers';
import { Permission } from '@/modules/rbac/decorators';
import { Depends } from '@/modules/restful/decorators';
import { ContentModule } from '../../content.module';


// 文章的后台管理权限
const permissions: Record<ApiActionType, PermissionChecker[]> = {
    create: [async (ab) => ab.can(PermissionAction.CREATE, PostEntity.name)],
    update: [async (ab) => ab.can(PermissionAction.UPDATE, PostEntity.name)],
    delete: [async (ab) => ab.can(PermissionAction.DELETE, PostEntity.name)],
    read_list: [async(ab) => ab.can(PermissionAction.READ_LIST, PostEntity.name)],
    read_detail: [async (ab) => ab.can(PermissionAction.READ_DETAIL, PostEntity.name)],
    restore: [async (ab) => ab.can(PermissionAction.RESTORE, PostEntity.name)]
}

@ApiTags("文章管理")
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(() => ({
    id: 'post',
    enabled: [
        { name: "list", options: simpleCrudOptions(permissions['read_list'], "文章分页查询") },
        { name: "detail", options: simpleCrudOptions(permissions['read_detail'], "查看文章详情") },
        { name: "create", options: simpleCrudOptions(permissions['create'], "创建文章") },
        { name: "update", options: simpleCrudOptions(permissions['update'], "更新文章") },
        { name: "delete", options: simpleCrudOptions(permissions['delete'], "删除文章，支持批量删除") },
        { name: "restore", options: simpleCrudOptions(permissions['restore'], "恢复软删除文章，支持批量恢复")}
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
    @Permission(...permissions['create'])
    @Post()
    async create(@Body() data: ManageCreatePostDto, @User() user: ClassToPlain<UserEntity>) {
        return this.service.create(data, user.id)
    }
}
