import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Controller } from '@nestjs/common';

import { Crud, Depends } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { UserService } from '../../services';
import { QueryUserDto, CreateUserDto, UpdateUserDto } from '../../dto';
import { PermissionChecker } from '@/modules/rbac/types';
import { ApiActionType, PermissionAction } from '@/modules/rbac/constants';
import { UserEntity } from '../../entities';
import { simpleCrudOptions } from '@/modules/rbac/helpers';
import { UserModule } from "../../user.module";

// const permissions: PermissionChecker[] = [
//     async (ab) => {
//         return ab.can(PermissionAction.MANAGE, UserEntity.name)
//     }
// ]


const permissions: Record<ApiActionType, PermissionChecker[]> = {
    create: [async (ab) => ab.can(PermissionAction.CREATE, UserEntity.name)],
    update: [async (ab) => ab.can(PermissionAction.UPDATE, UserEntity.name)],
    delete: [async (ab) => ab.can(PermissionAction.DELETE, UserEntity.name)],
    read_list: [async(ab) => ab.can(PermissionAction.READ_LIST, UserEntity.name)],
    read_detail: [async (ab) => ab.can(PermissionAction.READ_DETAIL, UserEntity.name)],
    restore: [async (ab) => ab.can(PermissionAction.RESTORE, UserEntity.name)]
}

// const permissions: 

/**
 * 用户后台管理的CRUD
 */
@ApiTags("用户管理")
@ApiBearerAuth()
@Depends(UserModule)
@Crud(async () => ({
    id: 'user',
    enabled: [
        { name: "create", options: simpleCrudOptions(permissions['create'], "创建用户") },
        { name: "delete", options: simpleCrudOptions(permissions['delete'], "删除用户，支持批量删除") },
        { name: "update", options: simpleCrudOptions(permissions['delete'], "更新用户") },
        { name: "list", options: simpleCrudOptions(permissions['read_list'], "分页查询用户") },
        { name: "detail", options: simpleCrudOptions(permissions['read_detail'], "用户详情") },
        { name: "restore", options: simpleCrudOptions(permissions['restore'], "恢复回收站用户") }
    ],
    dtos: {
        query: QueryUserDto,
        create: CreateUserDto,
        update: UpdateUserDto,
    },
}))
@Controller('users')
export class UserController extends BaseController<UserService> {
    constructor(protected service: UserService) {
        super(service);
    }
}
