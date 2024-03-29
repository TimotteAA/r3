import { Controller, Get, SerializeOptions, Query, ParseUUIDPipe, Param } from "@nestjs/common";

import { CategoryService } from "../services";
import { GUEST } from "@/modules/user/decorators";
import { ApiQueryCategoryDto } from "../dtos";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Depends } from "@/modules/restful/decorators";
import { ContentModule } from "../content.module";

@ApiTags("分类查询")
@Depends(ContentModule)
@Controller("categories") 
export class CategoryController {
  constructor(protected categoryService: CategoryService) {}

  /**
   * 获取分类树
   * @param options
   */
  @ApiOperation({
    summary: "查询分类树"
  })
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
  @ApiOperation({
    summary: "查询分类列表"
  })
  @GUEST()
  @SerializeOptions({ groups: ['category-list'] })
  @Get()
  async list(@Query() data: ApiQueryCategoryDto) {
    return this.categoryService.paginate({...data, trashed: false})
  }

  @ApiOperation({
    summary: "分类详情"
  })
  @GUEST()
  @SerializeOptions({ groups: ['category-detail'] })
  @Get(":id")
  async detail(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.categoryService.detail(id, false)
  }
}