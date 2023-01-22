import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    SerializeOptions,
    Body,
    Param,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import { CategoryService } from '../services';
import { QueryCategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../dtos';

@Controller('categories')
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    /**
     * 获取某篇文章的评论树
     * @param options
     */
    @SerializeOptions({ groups: ['category-tree'] })
    @Get('tree')
    async tree() {
        return this.categoryService.findTrees();
    }

    @SerializeOptions({ groups: ['category-list'] })
    @Get()
    async list(
        @Query()
        options: QueryCategoryDto,
    ) {
        return this.categoryService.paginate(options);
    }

    @SerializeOptions({ groups: ['category-detail'] })
    @Get(':id')
    async detail(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.categoryService.detail(id);
    }

    @SerializeOptions({ groups: ['category-detail'] })
    @Post()
    async create(
        @Body()
        data: CreateCategoryDto,
    ) {
        return this.categoryService.create(data);
    }

    @SerializeOptions({ groups: ['category-detail'] })
    @Patch()
    async update(
        @Body()
        data: UpdateCategoryDto,
    ) {
        return this.categoryService.update(data);
    }

    @SerializeOptions({ groups: ['category-detail'] })
    @Delete(':id')
    async delete(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.categoryService.delete(id);
    }
}
