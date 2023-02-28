import {
    Controller,
    Body,
    Get,
    Patch,
    Post,
    Param,
    SerializeOptions,
    Request,
    UseGuards,
    ParseUUIDPipe,
    Res,
} from '@nestjs/common';
import { omit } from 'lodash';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { stringify } from 'querystring';

import { GUEST } from '../decorators';
import { LocalAuthGuard } from '../guards';
import { AuthService, UserService } from '../services';
import { User } from '../decorators';
import { CaptchaType } from '../constants';
import { UserEntity } from '../entities';
import { CredentialDto, PhoneRegisterDto, RegisterDto, EmailRegisterDto, UpdateAccountDto, PhoneLoginDto, EmailLoginDto, PhoneRetrievePasswordDto, EmailRetrievePasswordDto, UpdatePasswordDto, BoundPhoneDto, BoundEmailDto, UploadAvatarDto } from '../dto';
import { AvatarService } from '@/modules/media/service';
import { Depends } from '@/modules/restful/decorators';
import { MediaModule } from '@/modules/media/media.module';
import { UserModule } from '../user.module';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Configure } from '@/modules/core/configure';

/**
 * 账户中心控制器
 */
@ApiTags("Auth操作")
@Depends(UserModule, MediaModule)
@Controller('account')
export class AccountController {
    constructor(
        private authService: AuthService, 
        private userService: UserService,
        private avatarService: AvatarService,
        private configure: Configure
    ) {}

    /**
     * 用户名、手机、邮箱+密码登录
     * @param user 
     * @param _data 
     */
    @Post('login')
    @ApiOperation({
        summary: "用户名、手机号、邮箱与密码登录"
    })
    @GUEST()
    @UseGuards(LocalAuthGuard)
    async login(@User() user: ClassToPlain<UserEntity>, @Body() _data: CredentialDto) {
        // local-auth guard已对_data进行了校验
        return { token: await this.authService.createToken(user.id) };
    }

    @Get("github")
    @ApiOperation({
        summary: "github授权登录"
    })
    @GUEST()
    @UseGuards(AuthGuard("github"))
    async googleLogin(@Res() res: FastifyReply) {
        const apiUrl = await this.configure.get<string>("app.api")

        return res.status(302).redirect(`https://github.com/login/oauth/authorize?${stringify({
            client_id: this.configure.env('GITHUB_CLIENT_ID'),
            redirect_uri: apiUrl + "/account/github/callback",
            scope: ['user'],
            state: new Date().toString()
        })}`,)
    }

    @Get("github/callback")
    @ApiOperation({
        summary: "github登录回调接口"
    })
    @GUEST()
    async googleLoginCallback(@Request() req: FastifyRequest) {
        // console.log("request", req)
        const user = await this.authService.loginGithub(req);
        return { token: await this.authService.createToken(user.id) }
    }

    /**
     * 推出登录
     * @param req 
     */
    @Post('logout')
    @ApiOperation({
        summary: "退出登录"
    })
    @ApiBearerAuth()
    async logout(@Request() req: any) {
        return this.authService.logout(req);
    }

    /**
     * 查看详情
     * 可以匿名访问，登录是查看自己
     * @param user 
     */
    @Get('profile/:id')
    @ApiOperation({
        summary: "查看用户详情"
    })
    @SerializeOptions({ groups: ['user-detail'] })
    @GUEST()
    async profile(
        @Param("id", new ParseUUIDPipe()) id: string,
    ) {
        const user = await this.userService.detail(id);
        return omit(user, ['permissions', 'roles', 'password'])
    }

    /**
     * 更新用户
     * @param user 
     * @param data 
     */
    @Patch()
    @ApiOperation({
        summary: "更新用户信息"
    })
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['user-detail'] })
    async update(@User() user: ClassToPlain<UserEntity>, @Body() data: UpdateAccountDto) {
        const res = await this.userService.update({ id: user.id, ...data });
        return omit(res, ['permissions', 'roles', 'password'])
    }

    /**
     * 更新账户密码
     * @param user 
     * @param data 
     */
    @Patch("reset-password")
    @ApiOperation({
        summary: "更换账户密码"
    })
    @ApiBearerAuth()
    @SerializeOptions({groups: ['user-detail']})
    async updatePassword(@User() user: ClassToPlain<UserEntity>, @Body() data: UpdatePasswordDto) {
        return this.userService.updatePassword(user.id, data.oldPassword, data.password)
    }

    /**
     * 普通的注册方式
     * @param data 
     */
    @Post("register")
    @ApiOperation({
        summary: "用户名、密码注册"
    })
    @GUEST()
    async register(@Body() data: RegisterDto) {
        return this.authService.register(data);
    }

    @Post("register-sms")
    @ApiOperation({
        summary: "手机注册"
    })
    @GUEST()
    async registerSms(@Body() data: PhoneRegisterDto) {
        return this.authService.registerSms(data);
    }

    /**
     * 邮箱注册
     * @param data 
     */
    @Post("register-email")
    @ApiOperation({
        summary: "邮箱注册"
    })
    @GUEST()
    async registerEmail(@Body() data: EmailRegisterDto) {
        return this.authService.registerEmail(data);
    }

    /**
     * 手机验证码登录
     * @param data 
     */
    @Post("login-sms")
    @ApiOperation({
        summary: "手机验证码登录"
    })
    @GUEST()
    async loginSms(@Body() data: PhoneLoginDto) {
        return this.authService.loginSms(data)
    }

    /**
     * 邮箱验证码登录
     */
    @Post("login-email")
    @ApiOperation({
        summary: "邮箱登录"
    })
    @GUEST()
    async loginEmail(@Body() data: EmailLoginDto) {
        return this.authService.loginEmail(data);
    }


    /**
     * 手机验证码重设密码
     * 其实就是更新密码...
     * @param */ 
    @Patch("retrieve-password-sms")
    @ApiOperation({
        summary: "手机重设密码"
    })
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
    @ApiOperation({
        summary: "邮箱重设密码"
    })
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
    @ApiOperation({
        summary: "绑定手机"
    })
    @ApiBearerAuth()
    async boundPhone(@User() user: ClassToPlain<UserEntity>, @Body() data: BoundPhoneDto) {
        return this.authService.bound(user, data, CaptchaType.SMS);
    }

    /**
     * 登录状态下绑定邮箱
     * @param user 
     * @param data 
     */
    @Patch("bound-email")
    @ApiOperation({
        summary: "绑定邮箱"
    })
    @ApiBearerAuth()
    async boundEmail(@User() user: ClassToPlain<UserEntity>, @Body() data: BoundEmailDto) {
        return this.authService.bound(user, data, CaptchaType.EMAIL);
    }


    @Post("avatar")
    @ApiOperation({
        summary: "上传头像"
    })
    @ApiConsumes("multipart/form-data")
    @ApiBearerAuth()
    async uploadAvatar(
        @Body() { image }: UploadAvatarDto,
        @User() user: ClassToPlain<UserEntity>
    ) { 
        // return this.cosService.upload(image);
        return this.avatarService.upload({
            file: image,
            user,
            relation: {
                id: user.id,
                entity: UserEntity,
                field: "avatar"
            },
            description: `${user.nickname ?? user.username}的头像`
        })
    }
}
