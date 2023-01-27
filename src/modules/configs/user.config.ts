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
});
