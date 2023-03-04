import { Controller } from '@nestjs/common';
import { CategoryService } from '../../services';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dtos/manage';
import { Crud } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { simpleCrudOptions } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { CategoryEntity } from '../../entities';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Depends } from '@/modules/restful/decorators';
import { ContentModule } from '../../content.module';
import { ApiActionType } from '@/modules/rbac/constants';

const permissions: Record<ApiActionType, PermissionChecker[]> = {
    create: [async (ab) => ab.can(PermissionAction.CREATE, CategoryEntity.name)],
    update: [async (ab) => ab.can(PermissionAction.UPDATE, CategoryEntity.name)],
    delete: [async (ab) => ab.can(PermissionAction.DELETE, CategoryEntity.name)],
    read_list: [async(ab) => ab.can(PermissionAction.READ_LIST, CategoryEntity.name)],
    read_detail: [async (ab) => ab.can(PermissionAction.READ_DETAIL, CategoryEntity.name)],
    restore: [async (ab) => ab.can(PermissionAction.RESTORE, CategoryEntity.name)]
}

@ApiTags("分类管理")
@ApiBearerAuth()
// 用于创建路由模块
@Depends(ContentModule)
@Crud(async () => ({
    id: 'category',
    enabled: [
        { name: "create", options: simpleCrudOptions(permissions['create'], "创建分类") },
        { name: "delete", options: simpleCrudOptions(permissions['delete'], "删除分类，支持批量删除与软删除") },
        { name: "update", options: simpleCrudOptions(permissions['update'], "更新分类") },
        { name: "list", options: simpleCrudOptions(permissions['read_list'], "查询分类分页列表") },
        { name: "detail", options: simpleCrudOptions(permissions['read_detail'], "查询分类详情") },
        { name: "restore", options: simpleCrudOptions(permissions['restore'], "恢复软删除分类") },
    ],
    dtos: {
        create: CreateCategoryDto,
        update: UpdateCategoryDto
    },
}))
@Controller('categories')
export class CategoryController extends BaseController<CategoryService> {
    constructor(protected categoryService: CategoryService) {
        super(categoryService);
    }
}
