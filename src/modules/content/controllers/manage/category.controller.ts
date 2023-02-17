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

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, CategoryEntity.name)
]

@ApiTags("分类管理")
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(async() => ({
    id: 'category',
    enabled: [
        { name: "create", options: simpleCrudOptions(permissions, {summary: "创建分类"}) },
        { name: "delete", options: simpleCrudOptions(permissions, {summary: "删除分类，支持批量删除与软删除"}) },
        { name: "update", options: simpleCrudOptions(permissions, {summary: "更新分类"}) },
        { name: "list", options: simpleCrudOptions(permissions, {summary: "查询分类分页列表"}) },
        { name: "detail", options: simpleCrudOptions(permissions, {summary: "查询分类详情"}) },
        { name: "restore", options: simpleCrudOptions(permissions, {summary: "恢复软删除分类"}) },
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
