import { UserConfig } from '@/modules/user/types';

export const userConfigFn: () => UserConfig = () => ({
    hash: 10,
    jwt: {
        secret: process.env.secret,
        token_expired: +process.env.token_expired,
        refresh_secret: process.env.refresh_secret,
        refresh_token_expired: +process.env.refresh_token_expired,
    },
});
