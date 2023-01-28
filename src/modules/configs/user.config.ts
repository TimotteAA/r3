import { toNumber } from 'lodash';
import { UserConfig } from '@/modules/utils';
import { env } from '../utils';

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
                limit: env("captcha_limit"),
                age: env("captcha_frequency")
            },
            register: {
                templateId: env('SMS_REGISTER_CAPTCHA_QCLOUD'),
                limit: env("captcha_limit"),
                age: env("captcha_frequency")
            },
            'retrieve-password': {
                templateId: env('SMS_RETRIEVEPASSWORD_CAPTCHA_QCLOUD'),
                limit: env("captcha_limit"),
                age: env("captcha_frequency")
            },
            "bound": {
                templateId: env('SMS_BOUND_CAPTCHA_QCLOUD'),
                limit: env("captcha_limit"),
                age: env("captcha_frequency")
            },
            'reset_password': {
                templateId: env('SMS_RETRIEVEPASSWORD_CAPTCHA_QCLOUD'),
                limit: env("captcha_limit"),
                age: env("captcha_frequency")
            }
        },
        email: {
            register: {},
            'retrieve-password': {},
        },
    }
});
