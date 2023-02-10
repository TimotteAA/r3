import { Controller, Get, SerializeOptions, Query, ParseUUIDPipe, Param } from "@nestjs/common";

import { CategoryService } from "../services";
import { GUEST } from "@/modules/user/decorators";
import { ApiQueryCategoryDto } from "../dtos";

@Controller("api/categories") 
export class CategoryController {
  constructor(protected categoryService: CategoryService) {}

  /**
   * 获取分类树
   * @param options
   */
  @GUEST()
  @SerializeOptions({ groups: ['category-tree'] })
  @Get('tree')
  async tree() {
      return this.categoryService.findTrees();
  }

  /**
   * 评论列表
   * @param data 
   */
  @GUEST()
  @SerializeOptions({ groups: ['category-list'] })
  @Get()
  async list(@Query() data: ApiQueryCategoryDto) {
    return this.categoryService.paginate({...data, trashed: false})
  }

  @GUEST()
  @SerializeOptions({ groups: ['category-detail'] })
  @Get(":id")
  async detail(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.categoryService.detail(id, false)
  }
}