/**
 * JWT的payload
 */
export interface JwtPayload {
    /**
     * 用户id
     */
    sub: string;
    /**
     * 过期时间
     */
    iat: number;
}

/**
 * 用户模块配置
 */
export interface UserConfig {
    // 加密算法位数，取10就好
    hash?: number;
    jwt: JwtConfig;
}

export interface JwtConfig {
    // accessToken加密密钥
    secret: string;
    token_expired: number;
    // refreshToken加密密钥
    refresh_secret: string;
    refresh_token_expired: number;
}

/**
 * 构造器类型
 */
export type ClassType<T> = { new (...args: any[]): T };
export type ClassToPlain<T> = { [key in keyof T]: T[key] };
