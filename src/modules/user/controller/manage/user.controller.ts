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
@Crud({
    id: 'user',
    enabled: [
        { name: "create", options: simpleCrudOptions(permissions) },
        { name: "delete", options: simpleCrudOptions(permissions) },
        { name: "update", options: simpleCrudOptions(permissions) },
        { name: "list", options: simpleCrudOptions(permissions) },
        { name: "detail", options: simpleCrudOptions(permissions) },
        { name: "restore", options: simpleCrudOptions(permissions) }
    ],
    dtos: {
        query: QueryUserDto,
        create: CreateUserDto,
        update: UpdateUserDto,
    },
})
@Controller('users')
export class UserController extends BaseController<UserService> {
    constructor(protected service: UserService) {
        super(service);
    }
}
