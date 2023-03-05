import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiConsumes } from "@nestjs/swagger";

import { BaseController } from "@/modules/restful/controller";
import { Crud } from "@/modules/restful/decorators";
import { MediaService, BannerService } from "../../service";
import { CreateBannerDto, UpdateBannerDto, UploadFileDto } from "../../dtos";
import { Depends } from "@/modules/restful/decorators";
import { MediaModule } from "../../media.module";
import { GUEST } from "@/modules/user/decorators";
import { CoreModule } from "@/modules/core/core.module";
import { TecentOsModule } from "@/modules/tencent-os/tecent-os.module";
import { Configure } from "@/modules/core/configure";
import { simpleCrudOptions } from "@/modules/rbac/helpers";

@ApiTags("文件管理-轮播图管理")
@Depends(MediaModule, CoreModule, TecentOsModule)
@Crud(async () => ({
    id: "banner",
    enabled: [
        { name: "create", options: simpleCrudOptions([], "创建新的轮播图") },
        { name: "update", options: simpleCrudOptions([], "更新指定轮播图") },
        { name: "detail", options: simpleCrudOptions([], "查看指定轮播图详情") },
        { name: "list", options: simpleCrudOptions([], "分页查询轮播图") },
        { name: "delete", options: simpleCrudOptions([], "删除轮播图，支持批量删除") }
    ],
    dtos: {
        create: CreateBannerDto,
        update: UpdateBannerDto
    }
}))
@Controller("banners")
export class BannerController extends BaseController<BannerService> {
    constructor(protected service: BannerService,
        protected mediaService: MediaService,
        protected configure: Configure,    
    ) {
        super(service)
    }

    @GUEST()
    @ApiOperation({
        summary: "上传轮播图图片"
    })
    @ApiConsumes('multipart/form-data')
    @Post("image")
    async upload(@Body() file: UploadFileDto) {
        const bucketPrefix = await this.configure.get<string>("cos.bannerPrefix")
        return this.mediaService.upload({
            file: file.image,
        }, bucketPrefix)
    }
}