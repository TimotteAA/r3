import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { TokenService } from '../services';
import { ALLOW_GUEST } from '@/modules/core/constants';
import { ExtractJwt } from 'passport-jwt';
import { isNil } from 'lodash';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector, private tokenService: TokenService) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        // 判断是否匿名访问
        // 自己定义的crud框架
        const crudGuest = Reflect.getMetadata(
            ALLOW_GUEST,
            context.getClass().prototype,
            context.getHandler().name,
        );
        const defaultGuest = this.reflector.getAllAndOverride<boolean>(ALLOW_GUEST, [
            context.getHandler(),
            context.getClass(),
        ]);
        const allowGuest = crudGuest ?? defaultGuest;
        if (allowGuest) return true;
        // 判断请求头中是否存在token
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        // xxx.xxx.xxx的字符串
        const requestToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        if (isNil(requestToken)) return false;
        // requestToken
        const tokenDb = await this.tokenService.findAccessToken(requestToken);
        if (isNil(tokenDb)) throw new UnauthorizedException();

        try {
            // 利用原生的进行校验
            return (await super.canActivate(context)) as boolean;
        } catch (e) {
            // 利用refreshToken刷新accessToken
            const newTokens = await this.tokenService.refreshTokens(tokenDb, response);
            if (isNil(newTokens)) {
                // 刷新失败
                throw new UnauthorizedException();
            }
            // 刷新成功
            if (newTokens.accessToken) {
                // 加到请求头上去
                request.headers.authorization = `Bearer ${newTokens.accessToken.value}`;
            }
            // 再次判断请求
            return super.canActivate(context) as boolean;
        }
    }

    handleRequest(err: any, user: any, _info: any) {
        // You can throw an exception based on either "info" or "err" arguments
        if (err || !user) {
            throw err || new UnauthorizedException();
        }
        return user;
    }
}
