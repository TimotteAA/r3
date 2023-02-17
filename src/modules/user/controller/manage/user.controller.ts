import { Crud } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { UserService } from '../../services';
import { Controller } from '@nestjs/common';
import { QueryUserDto, CreateUserDto, UpdateUserDto } from '../../dto';
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { UserEntity } from '../../entities';
import { simpleCrudOptions } from '@/modules/rbac/helpers';

const permissions: PermissionChecker[] = [
    async (ab) => {
        return ab.can(PermissionAction.MANAGE, UserEntity.name)
    }
]

/**
 * 用户后台管理的CRUD
 */
@Crud(async () => ({
    id: 'user',
    enabled: [
        { name: "create", options: simpleCrudOptions(permissions, { summary: "创建用户" }) },
        { name: "delete", options: simpleCrudOptions(permissions, { summary: "删除用户，支持批量删除" }) },
        { name: "update", options: simpleCrudOptions(permissions, { summary: "更新用户" }) },
        { name: "list", options: simpleCrudOptions(permissions, { summary: "分页查询用户" }) },
        { name: "detail", options: simpleCrudOptions(permissions, { summary: "用户详情" }) },
        { name: "restore", options: simpleCrudOptions(permissions, { summary: "恢复回收站用户" }) }
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
