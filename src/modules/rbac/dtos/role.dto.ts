import { PaginateOptions } from "@/modules/utils";
import { CustomDtoValidation } from "@/modules/core/decorators";
import { IsNotEmpty, IsOptional, IsUUID, MaxLength, IsNumber, Min, IsEnum } from "class-validator";
import { Transform } from "class-transformer";
import { toNumber } from "lodash";
import { PartialType } from "@nestjs/swagger";
import { IsExist } from "@/modules/database/constraints";
import { PermissionEntity } from "../entities";
import { TrashedDto } from "@/modules/core/types";
import { QueryTrashMode } from "@/modules/core/constants";
import { UserEntity } from "@/modules/user/entities";

@CustomDtoValidation({type: "query"})
export class QueryRoleDto implements PaginateOptions, TrashedDto {
  // 给了默认值可以不传
  @Transform(({ value }) => toNumber(value))
  @Min(1, {
      message: '最少是第$constraint1页',
  })
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @Transform(({ value }) => toNumber(value))
  @Min(5, {
      message: '每页最少数量是$constraint1个',
  })
  @IsNumber()
  @IsOptional()
  limit: number = 5;

  @IsEnum(QueryTrashMode)
  @IsOptional()
  trashed?: QueryTrashMode

  @IsExist(UserEntity, {
    message: "用户不存在"
  })
  @IsUUID(undefined, {
    message: "用户ID不对"
  })
  @IsOptional()
  user?: string;
}

@CustomDtoValidation({groups: ['create']})
export class CreateRoleDto {
  @MaxLength(50, {
    message: "角色名称的长度不能超过$constraint1",
    always: true
  })
  @IsNotEmpty({groups: ['create'], message: "角色名称必须填写"})
  @IsOptional({groups: ['update']})
  name!: string;

  @MaxLength(50, {
    message: "角色别名的长度不能超过$constraint1"
  })
  @IsOptional({always: true})
  label?: string;

  @MaxLength(100, {
    message: "角色描述的长度不能超过$constraint1"
  })
  @IsOptional({always: true})
  description?: string;

  @IsExist(PermissionEntity, {
    message: "权限不存在",
    always: true,
    each: true
  })
  @IsUUID(undefined, {
    each: true,
    message: "权限ID格式错误",
    always: true
  })
  @IsOptional({ always: true })
  permissions?: string[];
}

@CustomDtoValidation({groups: ['update']})
export class UpdateRoleDto extends PartialType(CreateRoleDto){
  @IsUUID(undefined, {
    groups: ['update'],
    message: "角色ID格式错误"
  })
  @IsNotEmpty({groups: ['update'], message: "角色ID不能为空"})
  id!: string;
}