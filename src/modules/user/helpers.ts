import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { OneToMany } from "typeorm"
import { isNil, toNumber } from 'lodash';

import { Configure } from '../core/configure';
import { UserConfig } from './types';
import { PostEntity, CommentEntity } from '../content/entities';
import { App } from '../core/app';
import { ConfigureFactory, ConfigureRegister } from '../core/types';
import { UserEntity, MessageEntity } from './entities';
import { PermissionAction } from '../rbac/constants';

/**
 * 获取user模块的配置
 * @param key 
 */
export const getUserConfig = async <T> (key?: string) => {
    return App.configure.get(isNil(key) ? 'user' : `user.${key}`) as T
}

/**
 * 对密码hash编码
 */
export const encrypt = async (password: string) => {
    const hash = await getUserConfig<number>("hash");
    console.log("hash", hash)
    return bcrypt.hashSync(password, hash);
};

/**
 * @param plainPassword 未hash的密码
 * @param password hash后的密码
 */
export const decrypt = (plainPassword: string, password: string) => {
    console.log(plainPassword, password);
    console.log(bcrypt.compareSync(plainPassword, password))
    return bcrypt.compareSync(plainPassword, password);
};

/**
 * 生成随机字符串
 */
export const generateRandonString = () => crypto.randomBytes(4).toString('hex').slice(0, 8);

/**
 * 生成随机验证码
 */
export function generateCatpchaCode() {
    return Math.random().toFixed(6).slice(-6);
}

/**
 * 默认用户配置
 * @param configure 
 */
export const defaultUserConfig = (configure: Configure): UserConfig => {
    const timeObj = {
        // 发送间隔
        limit: configure.env("CAPTCHA_FREQUENCY", toNumber),
        // 有效期
        age: configure.env("CAPTCHA_LIMIT", toNumber)
    }

    return {
        super: {
            username: configure.env("ADMIN", "admin"),
            password: configure.env("ADMIN_PASSWOR", "123456aA!")
        },
        hash: 10,
        jwt: {
            secret: configure.env("SECRET"),
            token_expired: configure.env("TOKEN_EXPIRED", toNumber),
            refresh_secret: configure.env("REFRESH_SECRET"),
            refresh_token_expired: configure.env("REFRESH_TOKEN_EXPIRED", toNumber),
        },
        captcha: {
            sms: {
                login: {
                    templateId: configure.env('SMS_LOGIN_CAPTCHA_QCLOUD'),
                    ...timeObj
                },
                register: {
                    templateId: configure.env('SMS_REGISTER_CAPTCHA_QCLOUD'),
                    ...timeObj
                },
                'retrieve_password': {
                    templateId: configure.env('SMS_RETRIEVEPASSWORD_CAPTCHA_QCLOUD'),
                    ...timeObj
                },
                "bound": {
                    templateId: configure.env('SMS_BOUND_CAPTCHA_QCLOUD'),
                    ...timeObj
                },
                'reset_password': {
                    templateId: configure.env('SMS_RETRIEVEPASSWORD_CAPTCHA_QCLOUD'),
                    ...timeObj
                }
            },
            email: {
                login: {
                    subject: configure.env("EMAIL_LOGIN"),
                    ...timeObj,
                },
                register: {
                    subject: configure.env("EMAIL_REGISTER"),
                    ...timeObj
                },
                'retrieve_password': {
                    subject: configure.env('EMAIL_RETRIEVEPASSWORD'),
                    ...timeObj
                },
                "bound": {
                    subject: configure.env('EMAIL_BOUND'),
                    ...timeObj
                },
                'reset_password': {
                    subject: configure.env('EMAIL_RESET'),
                    ...timeObj
                }
            },
        },
        // user字段是一
        relations: [
            {
                column: "posts",
                relation: OneToMany(() => PostEntity, (post: PostEntity) => post.author, {
                    cascade: true,
                })
            },
            {
                column: "comments",
                relation: OneToMany(() => CommentEntity, (comment: CommentEntity) => comment.author, {
                    cascade: true
                })
            }
        ],
        avatar: {
            default: configure.env("DEFAULT_AVATAR")
        },
        captchaTime: {
            ...timeObj
        }
    }
}

export const createUserConfig: (register: ConfigureRegister<RePartial<UserConfig>>) => 
ConfigureFactory<RePartial<UserConfig>, UserConfig> = (register) => ({
    register,
    defaultRegister: defaultUserConfig
})

export const addUserPermissions = () => ([
    {
        name: "system.user.create",
        rule: {
            action: PermissionAction.CREATE,
            subject: UserEntity
        }
    },
    {
        name: "system.user.update",
        rule: {
            action: PermissionAction.UPDATE,
            subject: UserEntity
    }   
    },
    {
        name: "system.user.delete",
        rule: {
            action: PermissionAction.DELETE,
            subject: UserEntity
        }
    },
    {
        name: "system.user.restore",
        rule: {
            action: PermissionAction.RESTORE,
            subject: UserEntity
        }
    },
    {
        name: "system.user.read_detail",
        rule: {
            action: PermissionAction.READ_DETAIL,
            subject: UserEntity
        }
    },
    {
        name: "system.user.read_list",
        rule: {
            action: PermissionAction.READ_LIST,
            subject: UserEntity
        }
    },
    {
        name: "system.message.read_list",
        rule: {
            action: PermissionAction.READ_LIST,
            subject: MessageEntity
        }
    },
    {
        name: "system.message.delete",
        rule: {
            action: PermissionAction.READ_LIST,
            subject: MessageEntity
        }
    },
])