import { Injectable, Inject, forwardRef, ForbiddenException, BadRequestException, UnauthorizedException, RequestTimeoutException } from '@nestjs/common';
import { FastifyRequest, FastifyRequest as Request } from 'fastify';
import { ExtractJwt } from 'passport-jwt';
import { isNil, omit } from 'lodash';
import { JwtModule } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from "rxjs";
import { AxiosError } from "axios";
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UserService, TokenService } from '../services';
import { decrypt, getUserConfig } from '../helpers';
import { CodeEntity, UserEntity } from '../entities';
import { getTime } from '@/modules/utils';
import { PhoneRegisterDto, RegisterDto, EmailRegisterDto, PhoneLoginDto, EmailLoginDto, BoundPhoneDto , BoundEmailDto } from "../dto";
import { CaptchaType } from '../constants';
import { UserConfig } from '../types';
import { Configure } from '@/modules/core/configure';
import { UserRepository } from '../repositorys';
import { CosService } from '@/modules/tencent-os/services';
import { AvatarEntity } from '@/modules/media/entities';




@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        // 循环依赖了
        @Inject(forwardRef(() => TokenService)) private tokenService: TokenService,
        @InjectRepository(CodeEntity) private codeRepo: Repository<CodeEntity>,
        protected httpService: HttpService,
        protected configure: Configure,
        protected userRepo: UserRepository,
        protected cosService: CosService,
    ) {}
    /**
     * localStrategy的用户名验证
     * @param username
     * @param pass
     * @returns
     */
    async validateUser(credential: string, pass: string): Promise<any> {

        const user = await this.userService.findOneByCredential(credential, async (qb: SelectQueryBuilder<UserEntity>) => {
            return qb.addSelect('user.password');
        });
        // console.log("user", user);
        if (decrypt(pass, user.password)) {
            return omit(user, 'password');
        }
        return false;
    }

    /**
     * localStrategy校验成功后，调用该方法返回token
     * @param user
     * @returns
     */
    async login(user: UserEntity) {
        const { accessToken } = await this.tokenService.generateAccessToken(user, await getTime());
        // 返回给前端
        return accessToken.value;
    }

    async loginGithub(req: FastifyRequest) {
        const { code, error } = (req.query) as any;
        if (!isNil(error)) throw new UnauthorizedException()
        const { data: gitUser } = await this.getGithubUser(code);

        const username = gitUser.login;
        const avatarUrl = gitUser.avatar_url;
        const email = gitUser.email;
        const nickname = gitUser.name;
        // console.log(gitUser)

        const conditions: Record<string, any> = {};
        conditions.username = username;
        if (!isNil(email)) conditions.email = email;
        if (!isNil(nickname)) conditions.nickname = nickname;

        const exists = await this.userRepo.findOneBy(conditions);
        const user = isNil(exists) ?
            await this.userService.create(conditions as any)
            : exists;
        

        // 处理用户头像
        // 用户首次用git登录
        if (isNil(exists)) {
            const avatar = new AvatarEntity;
            const key = await this.cosService.generateKey(avatarUrl);
            
            avatar.user = user;
            avatar.key = key;
            avatar.description = user.username + "的头像";

            avatar.isThird = true;
            avatar.thirdSrc = avatarUrl;
            await avatar.save();
        }
        return user;
    }

    protected async getGithubUser(code: string): Promise<any> {
        const res = await firstValueFrom(
            this.httpService.post(`https://github.com/login/oauth/access_token`, {
                client_id: this.configure.env('GITHUB_CLIENT_ID'),
                client_secret: this.configure.env("GITHUB_CLIENT_SECRET"),
                code
            }, {
                headers: {
                    Accept: "application/json"
                }
            })
            .pipe(
                catchError((error: AxiosError) => {
                    throw new RequestTimeoutException("Github连接超时..>.<..，请联系服务器管理员");
                }),
            ),
          )
        const data = res.data;
        if ("error" in data) throw new UnauthorizedException();

        const accessToken = data['access_token'];
        // https://api.github.com/user
        const user = await firstValueFrom(
            this.httpService.get(`https://api.github.com/user`, {
                headers: {
                    Authorization: "Bearer " + accessToken
                }
            })
            .pipe(
                catchError((error: AxiosError) => {
                    throw new RequestTimeoutException("Github连接超时..>.<..，请联系服务器管理员");
                }),
            ),
          )
        
        // console.log("user", user)
        
        return user;
    }

    async logout(request: Request) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request as any);
        if (token) {
            await this.tokenService.removeAccessToken(token);
        }
        return {
            msg: '退出成功',
        };
    }

    /**
     * 登录状态下绑定用户手机、密码
     */
    async bound(user: ClassToPlain<UserEntity>, data: BoundPhoneDto | BoundEmailDto, type: CaptchaType) {
        if (type === CaptchaType.EMAIL) {
            // 绑定邮箱
            const requestData = data as BoundEmailDto;
            const isValid = this.checkIsCaptchaValid(data.code, CaptchaType.EMAIL, requestData.email);
            if (!isValid) throw new BadRequestException("验证码已过期");
            const userDb = await this.userService.findOneByCondition({id: user.id});
            userDb.email = requestData.email;
            await userDb.save();
            return this.userService.detail(userDb.id);
        } else {
            // 绑定手机
            const requestData = data as BoundPhoneDto;
            const isValid = this.checkIsCaptchaValid(data.code, CaptchaType.SMS, requestData.phone);
            if (!isValid) throw new BadRequestException("验证码已过期");
            const userDb = await this.userService.findOneByCondition({id: user.id});
            userDb.phone = requestData.phone;
            await userDb.save();
            return this.userService.detail(userDb.id);
        }
    }
    

    /**
     * 普通的注册
     * 用户名、昵称、密码
     * @param data 
     */
    async register(data: RegisterDto) {
        const { username, password, nickname } = data;
        const user = await this.userService.create({
            username,
            password,
            nickname
        });
        return this.userService.findOneByCredential(user.username);
    }

    /**
     * 手机验证码注册
     * @param data 
     */
    async registerSms(data: PhoneRegisterDto) {
        const { code, phone } = data;
        const isValid = await this.checkIsCaptchaValid(code, CaptchaType.SMS, phone);
        if (!isValid) throw new BadRequestException("验证码已过期");
        // 创建user
        const user = new UserEntity();
        user.phone = phone;
        user.actived = true;
        // 保存user
        await user.save();
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 邮箱验证码注册
     * @param data 
     */
    async registerEmail(data: EmailRegisterDto) {
        const { code, email } = data;
        const isValid = await this.checkIsCaptchaValid(code, CaptchaType.EMAIL, email);
        if (!isValid) throw new BadRequestException("验证码已过期");
        // 创建user
        const user = new UserEntity();
        user.email = email;
        user.actived = true;
        // 保存user
        await user.save();
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 手机登录
     * @param data 
     */
    async loginSms(data: PhoneLoginDto) {
        const { code, phone } = data;
        const isValid = await this.checkIsCaptchaValid(code, CaptchaType.SMS, phone);
        if (!isValid) throw new BadRequestException("验证码已过期");
        // 查询用户的condition
        const condition = { phone };
        const user = await this.userService.findOneByCondition(condition);
        const { accessToken } = await this.tokenService.generateAccessToken(user,await  getTime());
        return { token: accessToken.value };
    }

    /**
     * 邮箱登录
     * @param data 
     */
    async loginEmail(data: EmailLoginDto) {
        const { code, email } = data;
        const isValid = await this.checkIsCaptchaValid(code, CaptchaType.EMAIL, email);
        if (!isValid) throw new BadRequestException("验证码已过期")
        // 查询用户的condition
        const condition = { email };
        const user = await this.userService.findOneByCondition(condition);
        const { accessToken } = await this.tokenService.generateAccessToken(user, await getTime());
        return { token: accessToken.value };
    }
 
    /**
    // 手机或者邮箱找回
     * 找回密码
     */
    async retrievePassword(password: string, code: string, media: string, type: CaptchaType) {
        const isValid = await this.checkIsCaptchaValid(code, type, media);
        if (!isValid) throw new BadRequestException("验证码已过期");
        // 查询用户
        const key = type === CaptchaType.EMAIL ? "email" : "phone";
        // 根据手机或邮箱查询user
        const condition = { [key]: media };
        // console.log(condition);
        const user = await this.userService.findOneByCondition(condition);
        if (isNil(user)) throw new UnauthorizedException(UserEntity, "user with " + key + " of " + media + " does not exist");

        // 更新用户的密码
        user.password = password;
        await user.save();
        return this.userService.findOneByCondition({id: user.id});
    }
 
    /**
     * 根据用户id创建一对新的token
     * @param id
     * @returns
     */
    async createToken(id: string) {
        const now = await getTime()
        let user: UserEntity;
        try {
            user = await this.userService.detail(id);
        } catch {
            throw new ForbiddenException();
        }
        const { accessToken } = await this.tokenService.generateAccessToken(user, now);
        return accessToken.value;
    }

    protected async checkIsCaptchaValid(code: string, type: CaptchaType, media: string) {
        const condition = { code, type, media }
        // console.log(condition);
        
        const captcha = await this.codeRepo.findOne({where: condition});
        if (isNil(captcha)) throw new BadRequestException(CodeEntity, '验证码不正确');
        // console.log(getTime({date: captcha.updatedAt}).add(timeObj.limit, "second"))
        // console.log(getTime());
        const age = await getUserConfig<number>("captchaTime.age")
        const isValid = (await getTime({date: captcha.updatedAt})).add(age, "second").isAfter(await getTime());
        return isValid;
    }

    /**
     * 注册jwtModule
     * @returns
     */
    static registerJwtModule() {
        return JwtModule.registerAsync({
            async useFactory() {
                const config = await getUserConfig<UserConfig['jwt']>("jwt")
                return {
                    secret: config.secret,
                    ignoreExpiration: process.env.mode === 'development',
                    signOptions: {
                        expiresIn: `${config.token_expired}s`,
                    },
                };
            },
        });
    }
}
