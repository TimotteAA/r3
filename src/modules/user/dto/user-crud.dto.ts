import { IsNotEmpty, IsOptional, IsUUID, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { CustomDtoValidation } from '@/modules/database/decorators';
import { BaseUserDto } from './base-user.dto';
import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { UserQueryOrder, UserDtoGroups } from '../constants';
import { toBoolean } from '@/modules/core/helpers';
import { IsExist } from '@/modules/database/constraints';
import { PermissionEntity, RoleEntity } from '@/modules/rbac/entities';
import { ListQueryDto } from '@/modules/restful/dto';

@CustomDtoValidation({ type: 'query' })
export class QueryUserDto extends ListQueryDto {
    @ApiPropertyOptional({
        description: "角色ID:根据用户角色，限制用户查询"
    })
    @IsExist(RoleEntity, {
        message: "角色不存在"
    })
    @IsUUID()
    @IsOptional()
    role?: string;

    @ApiPropertyOptional({
        description: "权限ID:根据用户权限（包含角色的权限）去重后，限制用户查询"
    })
    @IsExist(PermissionEntity, {
        message: "权限不存在"
    })
    @IsUUID()
    @IsOptional()
    permission?: string;

    @ApiPropertyOptional({
        description: "用户排序"
    })
    @IsEnum(UserQueryOrder, {
        message: `排序值必须是${Object.values(UserQueryOrder).join(',')}中的一个`
    })
    @IsOptional()
    orderBy?: UserQueryOrder

    @ApiPropertyOptional({
        description: "用户是否启用",
        type: Boolean
    })
    @IsBoolean({message: "isActive不是布尔类型"})
    @Transform(({value}) => toBoolean(value))
    @IsOptional()
    isActive?: boolean;
}

@CustomDtoValidation({ groups: [UserDtoGroups.CREATE] })
export class CreateUserDto extends PickType(BaseUserDto, ['username', 'nickname', 'password', 'email', 'phone']) {
    @ApiPropertyOptional({
        description: "用户是否激活",
        type: Boolean
    })
    @IsBoolean()
    @Transform(({value}) => toBoolean(value))
    @IsOptional({always: true})
    actived?: boolean = true;

    @ApiPropertyOptional({
        description: "角色ID数组",
        type: [String]
    })
    @IsExist(RoleEntity, {
        message: "角色不存在",
        always: true,
        each: true
    })
    @IsUUID(undefined, {
        message: "角色ID格式错误",
        always: true,
        each: true
    })
    @IsOptional({always: true})
    roles?: string[]

    @ApiPropertyOptional({
        description: "权限ID数组",
        type: [String]
    })
    @IsExist(PermissionEntity, {
        message: "权限不存在",
        always: true,
        each: true
    })
    @IsUUID(undefined, {
        message: "权限ID格式错误",
        always: true,
        each: true
    })
    @IsOptional({always: true})
    permissions?: string[]
}

@CustomDtoValidation({ groups: [UserDtoGroups.UPDATE] })
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: "更新的角色ID"
    })
    @IsUUID(undefined, {
        groups: ['update'],
        message: 'ID格式错误',
    })
    @IsNotEmpty({
        groups: ['update'],
        message: 'ID不能为空',
    })
    id!: string;
}
