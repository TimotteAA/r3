import { MultipartFile } from "@fastify/multipart";

import { CustomDtoValidation } from "@/modules/core/decorators";
import { IsDefined, IsOptional } from "class-validator";
import { IsFileLimit } from "@/modules/core/constraints";

/**
 * 上传文件dto，可以是image，也可以是别的字段
 */
@CustomDtoValidation()
export class UploadFileDto {
  @IsFileLimit({
    fileSize: 1024 * 1024 * 5,
    mimetypes: ['image/png', 'image/gif', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  }, { 
    always: true
   })
  @IsDefined({ groups: ['create'], message: "image can not be empty" })
  @IsOptional({ groups: ['update'] })
  image: MultipartFile;
}