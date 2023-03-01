import { CustomDtoValidation } from "@/modules/database/decorators";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional, MaxLength, Max, Min, IsNumber} from "class-validator";
import { CreateImageRequestSizeEnum, CreateImageRequestResponseFormatEnum } from "openai";
import { toNumber } from "lodash";

@CustomDtoValidation()
export class EditImageDto {
    /**
     * 图片描述
     */
    @MaxLength(500)
    text!: string;
    
    /**
     * 生成的图片数
     */
    @IsNumber()
    @Transform(({value}) => toNumber(value))
    @Min(1)
    @Max(5)
    @IsOptional()
    n?: number = 1;

    @IsEnum(CreateImageRequestSizeEnum, {
        message: "图片大小必须是" + Object.values(CreateImageRequestSizeEnum).join(",") + "中的一个"
    })
    @IsOptional()
    size?: CreateImageRequestSizeEnum = CreateImageRequestSizeEnum._256x256;

    @IsEnum(CreateImageRequestResponseFormatEnum, {
        message: "相应图片格式" + Object.values(CreateImageRequestResponseFormatEnum).join(",") + "中的一个",
    })
    @IsOptional()
    format?: CreateImageRequestResponseFormatEnum = CreateImageRequestResponseFormatEnum.Url;
}