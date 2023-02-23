import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';
import { JwtPayload, UserConfig } from '../types';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenEntity, RefreshTokenEntity, UserEntity } from '../entities';
import dayjs from 'dayjs';
import { FastifyReply as Response } from 'fastify';
import { getTime } from '@/modules/utils';
import { getUserConfig } from '../helpers';

@Injectable()
export class TokenService {
    // private readonly config: JwtConfig;
    constructor(private jwtService: JwtService) {
        // this.config = userConfigFn().jwt;
    }

    /**
     * 刷新token
     * @returns 新的accessToken或者null
     */
    async refreshTokens(accessToken: AccessTokenEntity, response: Response) {
        // 查找老的accessToken是否存在
        const token = await this.findAccessToken(accessToken.value);
        if (!token) return null;

        const { user, refreshToken } = token;
        if (refreshToken) {
            // 判断refreshToken是否过期
            const now = getTime()
            // 过期了
            if (now.isAfter(refreshToken.expired_at)) return null;
            const token = await this.generateAccessToken(user, now);
            // 删除老的accessToken
            await accessToken.remove();
            // 把新的token加到响应上去
            response.header('token', token);
            return token;
        }
        return null;
    }

    /**
     * 根据用户信息与当前时间创建accessToken与refreshToken
     */
    async generateAccessToken(user: UserEntity, now: dayjs.Dayjs) {
        const tokenPayload: JwtPayload = {
            sub: user.id,
            iat: now.unix(),
        };

        const token = this.jwtService.sign(tokenPayload);
        // 创建accessToken
        const accessToken = new AccessTokenEntity();
        accessToken.value = token;
        accessToken.user = user;
        // 加上有效期
        const jwtConfig = await getUserConfig<UserConfig['jwt']>("jwt")
        // console.log("jwtConfig", jwtConfig)
        accessToken.expired_at = now.add(jwtConfig.token_expired, 'second').toDate();
        // 保存accessToken
        await accessToken.save();
        const refreshToken = await this.generateRefreshToken(accessToken, getTime());
        return { accessToken, refreshToken };
    }

    /**
     * 创建RefreshToken
     * @param accessToken
     * @param now
     * @returns
     */
    async generateRefreshToken(accessToken: AccessTokenEntity, now: dayjs.Dayjs) {
        // refreshToken payload，uuid
        const refreshTokenPayload = {
            uuid: uuid(),
        };
        // 创建refreshToken
        const refreshToken = new RefreshTokenEntity();
        const jwtConfig = await getUserConfig<UserConfig['jwt']>("jwt")
        refreshToken.value = jwt.sign(refreshTokenPayload, jwtConfig.refresh_secret);
        refreshToken.expired_at = now.add(jwtConfig.refresh_token_expired, 'second').toDate();
        refreshToken.accessToken = accessToken;
        // 保存到数据库
        await refreshToken.save();
        return refreshToken;
    }

    /**
     * 解析token，得到payload
     * @param token 
     */
    async verifyAccessToken(token: string) {
        const config = await getUserConfig<UserConfig['jwt']>("jwt")
        return jwt.verify(token, config.secret);
    }


    /**
     * 根据token值查找accessToken
     */
    async findAccessToken(value: string) {
        return AccessTokenEntity.findOne({
            where: {
                value,
            },
            relations: ['user', 'refreshToken'],
        });
    }

    /**
     * 删除accessToken
     */
    async removeAccessToken(value: string) {
        const accessToken = await AccessTokenEntity.findOne({
            where: {
                value,
            },
            relations: ['refreshToken'],
        });
        if (accessToken) await accessToken.remove();
    }

    /**
     * 删除refreshToken
     */
    async removeRefreshToken(value: string) {
        const refreshToken = await RefreshTokenEntity.findOne({
            where: {
                value,
            },
            relations: ['accessToken'],
        });
        if (refreshToken) {
            if (refreshToken.accessToken) await refreshToken.accessToken.remove();
            await refreshToken.remove();
        }
    }
}
