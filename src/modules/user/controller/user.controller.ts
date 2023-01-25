import { BaseController } from '@/modules/core/crud';
import { UserService } from '../services';
import { Crud } from '@/modules/core/decorators';
import { Controller } from '@nestjs/common';
import { QueryUserDto, CreateUserDto, UpdateUserDto } from '../dto';

/**
 * 用户后台管理的CRUD
 */
@Controller('users')
@Crud({
    id: 'user',
    enabled: [
        'create',
        'delete',
        'update',
        'list',
        {
            name: 'detail',
            options: { allowGuest: true },
        },
    ],
    dtos: {
        query: QueryUserDto,
        create: CreateUserDto,
        update: UpdateUserDto,
    },
})
export class UserController extends BaseController<UserService> {
    constructor(protected service: UserService) {
        super(service);
    }
}
