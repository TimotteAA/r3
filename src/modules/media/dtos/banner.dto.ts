import { CustomDtoValidation } from "@/modules/database/decorators";
import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, MaxLength, IsUrl, IsNotEmpty, IsUUID, IsNumber } from "class-validator";

@CustomDtoValidation({ groups: ['create'] })
export class CreateBannerDto {
    @MaxLength(50, {
        message: "banner长度不能超过50",
        
    })
    @IsNotEmpty({groups: ['create']})
    @IsOptional({groups: ['update']})
    name!: string;

    @IsUUID(undefined, {
        message: "banner图片ID格式不对"
    })
    @IsNotEmpty({groups: ['create']})
    @IsOptional({groups: ['update']})
    image!: string;

    /**
     * 轮播图跳转链接
     */
    @ApiPropertyOptional({
        description: "轮播图跳转url"
    })
    @IsUrl(undefined, {
        message: "跳转链接不是url",
        always: true
    })
    @IsOptional({always: true})
    link?: string;

    @ApiPropertyOptional({
        description: "轮播图描述",
    })
    @MaxLength(200, {
        message: '轮播图描述长度不能超过200',
        // groups: ['create', 'update']
        always: true
    })
    @IsOptional({always: true})
    description?: string;

    @IsNumber()
    @IsOptional({always: true})
    customOrder?: number = 0;
}

@CustomDtoValidation({groups: ['update']})
export class UpdateBannerDto extends PartialType(CreateBannerDto) {
    @IsUUID(undefined, {
        message: "bannerID格式错误",
        groups: ['update']
    })
    @IsNotEmpty({
        message: "bannerID不能为空",
        groups: ['update']
    })
    id!: string;
}