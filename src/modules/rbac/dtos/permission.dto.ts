import { Injectable } from "@nestjs/common";
import {  IsOptional, IsUUID } from "class-validator";
import { RoleEntity } from "../entities";
import { IsExist } from "@/modules/database/constraints";
import { ListQueryDto } from "@/modules/restful/dto";
import { CustomDtoValidation } from "@/modules/core/decorators";
import { OmitType } from "@nestjs/swagger";

@CustomDtoValidation({type: "query"})
@Injectable()
export class QueryPermissionDto extends OmitType(ListQueryDto, ['trashed']) {
  @IsExist(RoleEntity, {
    message: "角色不存在",
  })
  @IsUUID(undefined, {
    message: "角色ID格式错误",
  })
  @IsOptional()
  role?: string;
}