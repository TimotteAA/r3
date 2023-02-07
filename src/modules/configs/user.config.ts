import { toNumber } from 'lodash';
import { OneToMany } from 'typeorm';
import { UserConfig } from '@/modules/utils';
import { env } from '../utils';
import { PostEntity, CommentEntity } from '../content/entities';

export const timeObj: {age: number, limit: number} = {
    // 发送间隔
    limit: env("captcha_frequency", toNumber),
    // 有效期
    age: env("captcha_limit", toNumber)
}

export const userConfigFn: () => UserConfig = () => ({
    hash: 10,
    jwt: {
        secret: env("secret"),
        token_expired: env("token_expired", toNumber),
        refresh_secret: env("refresh_secret"),
        refresh_token_expired: env("refresh_token_expired", toNumber),
    },
    captcha: {
        sms: {
            login: {
                templateId: env('SMS_LOGIN_CAPTCHA_QCLOUD'),
                ...timeObj
            },
            register: {
                templateId: env('SMS_REGISTER_CAPTCHA_QCLOUD'),
                ...timeObj
            },
            'retrieve_password': {
                templateId: env('SMS_RETRIEVEPASSWORD_CAPTCHA_QCLOUD'),
                ...timeObj
            },
            "bound": {
                templateId: env('SMS_BOUND_CAPTCHA_QCLOUD'),
                ...timeObj
            },
            'reset_password': {
                templateId: env('SMS_RETRIEVEPASSWORD_CAPTCHA_QCLOUD'),
                ...timeObj
            }
        },
        email: {
            login: {
                subject: env("EMAIL_LOGIN"),
                ...timeObj,
            },
            register: {
                subject: env("EMAIL_REGISTER"),
                ...timeObj
            },
            'retrieve_password': {
                subject: env('EMAIL_RETRIEVEPASSWORD'),
                ...timeObj
            },
            "bound": {
                subject: env('EMAIL_BOUND'),
                ...timeObj
            },
            'reset_password': {
                subject: env('EMAIL_RESET'),
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
    ]
});
