import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Controller } from '@nestjs/common';

import { Crud, Depends } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { UserService } from '../../services';
import { QueryUserDto, CreateUserDto, UpdateUserDto } from '../../dto';
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { UserEntity } from '../../entities';
import { simpleCrudOptions } from '@/modules/rbac/helpers';
import { UserModule } from "../../user.module";

const permissions: PermissionChecker[] = [
    async (ab) => {
        return ab.can(PermissionAction.MANAGE, UserEntity.name)
    }
]

/**
 * 用户后台管理的CRUD
 */
@ApiTags("用户管理")
@ApiBearerAuth()
@Depends(UserModule)
@Crud(async () => ({
    id: 'user',
    enabled: [
        { name: "create", options: simpleCrudOptions(permissions, "创建用户") },
        { name: "delete", options: simpleCrudOptions(permissions, "删除用户，支持批量删除") },
        { name: "update", options: simpleCrudOptions(permissions, "更新用户") },
        { name: "list", options: simpleCrudOptions(permissions, "分页查询用户") },
        { name: "detail", options: simpleCrudOptions(permissions, "用户详情") },
        { name: "restore", options: simpleCrudOptions(permissions, "恢复回收站用户") }
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
