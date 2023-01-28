import { Injectable, Inject, forwardRef, ForbiddenException } from '@nestjs/common';
import { FastifyRequest as Request } from 'fastify';
import { ExtractJwt } from 'passport-jwt';
import { omit } from 'lodash';
import { userConfigFn } from '@/modules/configs';
import { JwtModule } from '@nestjs/jwt';
import { UserService, TokenService } from '../services';
import { decrypt } from '../helpers';
import { UserEntity } from '../entities';
import { SelectQueryBuilder } from 'typeorm';
import { getTime } from '@/modules/utils';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        // 循环依赖了
        @Inject(forwardRef(() => TokenService)) private tokenService: TokenService,
    ) {}

    /**
     * localStrategy的用户名验证
     * @param username
     * @param pass
     * @returns
     */
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userService.findOneByCredential(username, async (qb: SelectQueryBuilder<UserEntity>) => {
            return qb.addSelect('user.password');
        });
        console.log(user)
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
        const { accessToken } = await this.tokenService.generateAccessToken(user, getTime());
        // 返回给前端
        return accessToken.value;
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
     * 根据用户id创建一对新的token
     * @param id
     * @returns
     */
    async createToken(id: string) {
        const now = getTime()
        let user: UserEntity;
        try {
            user = await this.userService.detail(id);
        } catch {
            throw new ForbiddenException();
        }
        const { accessToken } = await this.tokenService.generateAccessToken(user, now);
        return accessToken.value;
    }

    /**
     * 注册jwtModule
     * @returns
     */
    static registerJwtModule() {
        return JwtModule.registerAsync({
            useFactory() {
                const config = userConfigFn();
                return {
                    secret: config.jwt.secret,
                    ignoreExpiration: process.env.mode === 'development',
                    signOptions: {
                        expiresIn: `${config.jwt.token_expired}s`,
                    },
                };
            },
        });
    }
}
