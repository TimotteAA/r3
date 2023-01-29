import { SmtpOptions, env } from "@/modules/utils"
import path from 'path';

export const smtpConfigFn: () => SmtpOptions = () => ({
    host: env('SMTP_HOST'),
    user: env('SMTP_USER'),
    password: env('SMTP_PASSWORD'),
    from: env('SMTP_FROM', '啦啦啦<support@localhost>'),
    port: env('SMTP_PORT', (v) => Number(v), 25),
    secure: env('SMTP_SSL', (v) => JSON.parse(v), false),
    // Email模板路径
    resource: path.resolve(__dirname, '../../assets/emails'),
});
