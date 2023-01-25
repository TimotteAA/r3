import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services';
import { instanceToPlain } from 'class-transformer';

/**
 * 用户本地认证策略
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        // 设置local-strategy的校验字段
        super({
            usernameField: 'credential',
            passwordField: 'password',
        });
    }

    /**
     * 校验完的user将会被放到request.user上
     */
    async validate(credential: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(credential, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        /**
         * 序列化后放到request.user上
         */
        return instanceToPlain(user);
    }
}
