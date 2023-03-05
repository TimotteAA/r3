import { Depends } from "@/modules/restful/decorators";
import { ListQueryDto } from "@/modules/restful/dto";
import { GUEST } from "@/modules/user/decorators";
import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { MediaModule } from "../media.module";
import { BannerService } from "../service";

@ApiTags("Banner查询")
@Controller("banners")
@Depends(MediaModule)
export class BannerController {
    constructor(protected service: BannerService) {}

    @ApiOperation({
        summary: "分页查询轮播图"
    })
    @Get()
    @GUEST()
    async list(@Query() data: ListQueryDto) {
        return this.service.paginate({ ...data, trashed: false })
    }
}