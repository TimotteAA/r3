import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';
import { CategoryService } from '../services';
import { QueryCategoryDto, CreateCategoryDto, UpdateCategoryDto, QueryCategoryTreeDto } from '../dtos';
import { BaseController } from '@/modules/core/crud';
import { Crud } from '@/modules/core/decorators';

@Controller('categories')
@Crud({
    id: 'category',
    enabled: [
        'create',
        'delete',
        'update',
        {
            name: 'list',
            options: { allowGuest: true },
        },
        {
            name: 'detail',
            options: { allowGuest: true },
        },
        "deleteMulti",
        "restore",
        "restoreMulti"
    ],
    dtos: {
        create: CreateCategoryDto,
        update: UpdateCategoryDto,
        query: QueryCategoryDto,
    },
})
export class CategoryController extends BaseController<CategoryService> {
    constructor(protected categoryService: CategoryService) {
        super(categoryService);
    }

    /**
     * 获取某篇文章的评论树
     * @param options
     */
    @SerializeOptions({ groups: ['category-tree'] })
    @Get('tree')
    async tree(@Query() options: QueryCategoryTreeDto) {
        return this.categoryService.findTrees(options);
    }
}
