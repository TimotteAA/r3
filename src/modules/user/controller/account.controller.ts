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
import { ClassToPlain } from '@/modules/utils';
import { CaptchaType } from '../constants';
import { UserEntity } from '../entities';
import { CredentialDto, PhoneRegisterDto, RegisterDto, EmailRegisterDto, UpdateAccountDto, PhoneLoginDto, EmailLoginDto, PhoneRetrievePasswordDto, EmailRetrievePasswordDto, UpdatePasswordDto, BoundPhoneDto, BoundEmailDto } from '../dto';

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

    /**
     * 推出登录
     * @param req 
     */
    @Post('logout')
    async logout(@Request() req: any) {
        return this.authService.logout(req);
    }

    /**
     * 查看详情
     * @param user 
     */
    @Get('profile')
    @SerializeOptions({ groups: ['user-detail'] })
    async profile(@User() user: ClassToPlain<UserEntity>) {
        console.log(user);
        return this.userService.detail(user.id);
    }

    /**
     * 更新用户
     * @param user 
     * @param data 
     */
    @Patch()
    @SerializeOptions({ groups: ['user-detail'] })
    async update(@User() user: ClassToPlain<UserEntity>, @Body() data: UpdateAccountDto) {
        return this.userService.update({ id: user.id, ...data });
    }

    /**
     * 更新账户密码
     * @param user 
     * @param data 
     */
    @Patch("reset-password")
    @SerializeOptions({groups: ['user-detail']})
    async updatePassword(@User() user: ClassToPlain<UserEntity>, @Body() data: UpdatePasswordDto) {
        return this.userService.updatePassword(user.id, data.oldPassword, data.password)
    }

    /**
     * 普通的注册方式
     * @param data 
     */
    @Post("register")
    @GUEST()
    async register(@Body() data: RegisterDto) {
        return this.authService.register(data);
    }

    @Post("register-sms")
    @GUEST()
    async registerSms(@Body() data: PhoneRegisterDto) {
        return this.authService.registerSms(data);
    }

    /**
     * 邮箱注册
     * @param data 
     */
    @Post("register-email")
    @GUEST()
    async registerEmail(@Body() data: EmailRegisterDto) {
        return this.authService.registerEmail(data);
    }

    /**
     * 手机验证码登录
     * @param data 
     */
    @Post("login-sms")
    @GUEST()
    async loginSms(@Body() data: PhoneLoginDto) {
        return this.authService.loginSms(data)
    }

    /**
     * 邮箱验证码登录
     */
    @Post("login-email")
    @GUEST()
    async loginEmail(@Body() data: EmailLoginDto) {
        return this.authService.loginEmail(data);
    }


    /**
     * 手机验证码重设密码
     * 其实就是更新密码...
     * @param */ 
    @Patch("retrieve-password-sms")
    @GUEST()
    async retrievePasswordSms(@Body() data: PhoneRetrievePasswordDto) {
        const { password, code, phone } = data;
        return this.authService.retrievePassword(password, code, phone, CaptchaType.SMS)
    }

    
    /**
     * 邮箱验证码重设密码
     * 其实就是更新密码...
     * @param */ 
    @Patch("retrieve-password-email")
    @GUEST()
    async retrievePasswordEmail(@Body() data: EmailRetrievePasswordDto) {
        const { password, code, email } = data;
        return this.authService.retrievePassword(password, code, email, CaptchaType.EMAIL)
    }

    /**
     * 登录状态下绑定手机
     * @param user 
     * @param data 
     */
    @Patch("bound-phone")
    async boundPhone(@User() user: ClassToPlain<UserEntity>, @Body() data: BoundPhoneDto) {
        return this.authService.bound(user, data, CaptchaType.SMS);
    }

    /**
     * 登录状态下绑定邮箱
     * @param user 
     * @param data 
     */
    @Patch("bound-email")
    async boundEmail(@User() user: ClassToPlain<UserEntity>, @Body() data: BoundEmailDto) {
        return this.authService.bound(user, data, CaptchaType.EMAIL);
    }
}
