import {
    Controller,
    Body,
    Get,
    Patch,
    Post,
    SerializeOptions,
    Request,
    UseGuards,
} from '@nestjs/common';
import { GUEST } from '../decorators';
import { LocalAuthGuard } from '../guards';
import { AuthService, UserService } from '../services';
import { User } from '../decorators';
import { ClassToPlain } from '../types';
import { UserEntity } from '../entities';
import { CredentialDto, UpdateAccountDto } from '../dto';

/**
 * 账户中心控制器
 */
@Controller('account')
export class AccountController {
    constructor(private authService: AuthService, private userService: UserService) {}

    @Post('login')
    @GUEST()
    @UseGuards(LocalAuthGuard)
    async login(@User() user: ClassToPlain<UserEntity>, @Body() _data: CredentialDto) {
        // local-auth guard已对_data进行了校验
        return { token: await this.authService.createToken(user.id) };
    }

    @Post('logout')
    async logout(@Request() req: any) {
        return this.authService.logout(req);
    }

    @Get('profile')
    @SerializeOptions({ groups: ['user-detail'] })
    async profile(@User() user: ClassToPlain<UserEntity>) {
        return this.userService.detail(user.id);
    }

    @Patch()
    @SerializeOptions({ groups: ['user-detail'] })
    async update(@User() user: ClassToPlain<UserEntity>, @Body() data: UpdateAccountDto) {
        return this.userService.update({ id: user.id, ...data });
    }
}
