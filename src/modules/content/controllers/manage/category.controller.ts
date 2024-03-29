import { Controller } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';
import { simpleCrudOptions } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';
import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';

import { ContentModule } from '../../content.module';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dtos/manage';
import { CategoryEntity } from '../../entities';
import { CategoryService } from '../../services';

const permission: PermissionChecker = async (ab) =>
    ab.can(PermissionAction.MANAGE, CategoryEntity.name);

@ApiTags('分类管理')
@ApiBearerAuth()
// 用于创建路由模块
@Depends(ContentModule)
@Crud(async () => ({
    id: 'category',
    enabled: [
        { name: 'create', options: simpleCrudOptions([permission], '创建分类') },
        {
            name: 'delete',
            options: simpleCrudOptions([permission], '删除分类，支持批量删除与软删除'),
        },
        { name: 'update', options: simpleCrudOptions([permission], '更新分类') },
        { name: 'list', options: simpleCrudOptions([permission], '查询分类分页列表') },
        { name: 'detail', options: simpleCrudOptions([permission], '查询分类详情') },
        { name: 'restore', options: simpleCrudOptions([permission], '恢复软删除分类') },
    ],
    dtos: {
        create: CreateCategoryDto,
        update: UpdateCategoryDto,
    },
}))
@Controller('categories')
export class CategoryController extends BaseController<CategoryService> {
    constructor(protected categoryService: CategoryService) {
        super(categoryService);
    }
}
