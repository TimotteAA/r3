import { Controller } from '@nestjs/common';
import { CategoryService } from '../../services';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dtos/manage';
import { Crud } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { simpleCrudOptions } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { CategoryEntity } from '../../entities';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, CategoryEntity.name)
]

@Crud({
    id: 'category',
    enabled: [
        { name: "create", options: simpleCrudOptions(permissions) },
        { name: "delete", options: simpleCrudOptions(permissions) },
        { name: "update", options: simpleCrudOptions(permissions) },
        { name: "list", options: simpleCrudOptions(permissions) },
        { name: "detail", options: simpleCrudOptions(permissions) },
        { name: "restore", options: simpleCrudOptions(permissions) },
    ],
    dtos: {
        create: CreateCategoryDto,
        update: UpdateCategoryDto
    },
})
@Controller('categories')
export class CategoryController extends BaseController<CategoryService> {
    constructor(protected categoryService: CategoryService) {
        super(categoryService);
    }
}
