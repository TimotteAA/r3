import { Controller, Delete, Body } from '@nestjs/common';
import { CommentService } from '../../services';
import { ManageCommentQuery } from '../../dtos/manage';
import { Crud } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { CommentEntity } from '../../entities';
import { simpleCrudOptions } from '@/modules/rbac/helpers';
import { DeleteDto } from '@/modules/restful/dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Depends } from '@/modules/restful/decorators';
import { ContentModule } from '../../content.module';

const permissions: PermissionChecker[] = [
    async ab => ab.can(PermissionAction.MANAGE, CommentEntity.name)
]

@ApiTags("文章管理")
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(() => ({
    id: "comment",
    enabled: [
        { name: "list", options: simpleCrudOptions(permissions, { summary: "评论分类列表查询，支持查询某个作者、某篇文章的评论" }) },
        { name: "delete", options: simpleCrudOptions(permissions, {
            summary: "删除评论，支持批量删除"
        }) }
    ],
    dtos: {
        query: ManageCommentQuery
    }
}))
@Controller('comments')
export class CommentController extends BaseController<CommentService> {
    constructor(protected commentService: CommentService) {
        super(commentService)
    }

    @ApiOperation({ summary: "删除评论，支持批量删除" })
    @Delete()
    async delete(@Body() options: DeleteDto): Promise<any> {
        return super.delete({ ...options, trashed: false })
    }
}
