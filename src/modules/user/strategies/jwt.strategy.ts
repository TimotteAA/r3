import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { userConfigFn } from '@/modules/configs';
import { JwtPayload } from '../types';
import { UserRepository } from '../repositorys';
import { instanceToPlain } from 'class-transformer';

/**
 * 登陆后访问的JWT策略
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private userRepository: UserRepository) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: userConfigFn().jwt.secret,
        });
    }

    /**
     * 对用户携带的jwt payload进行解析
     * 将解析出的user放到Request上去
     * @param payload
     * @returns
     */
    async validate(payload: JwtPayload) {
        const user = await this.userRepository.findOneOrFail({ where: { id: payload.sub } });
        return instanceToPlain(user);
    }
}
