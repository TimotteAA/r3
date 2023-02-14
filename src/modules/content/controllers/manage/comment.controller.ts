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

const permissions: PermissionChecker[] = [
    async ab => ab.can(PermissionAction.MANAGE, CommentEntity.name)
]

@Crud({
    id: "comment",
    enabled: [
        { name: "list", options: simpleCrudOptions(permissions) },
        { name: "delete", options: simpleCrudOptions(permissions) }
    ],
    dtos: {
        query: ManageCommentQuery
    }
})
@Controller('comments')
export class CommentController extends BaseController<CommentService> {
    constructor(protected commentService: CommentService) {
        super(commentService)
    }

    @Delete()
    async delete(@Body() options: DeleteDto): Promise<any> {
        return super.delete({ ...options, trashed: false })
    }
}
