import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { userConfigFn } from '../configs';
import crypto from 'crypto';

// dayjs插件
import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import localeData from 'dayjs/plugin/localeData';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(localeData);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(dayOfYear);

/**
 * 对密码hash编码
 */
export const encrypt = (password: string) => {
    return bcrypt.hashSync(password, userConfigFn().hash);
};

/**
 * @param plainPassword 未hash的密码
 * @param password hash后的密码
 */
export const decrypt = (plainPassword: string, password: string) => {
    return bcrypt.compareSync(plainPassword, password);
};

export const generateRandonString = () => crypto.randomBytes(4).toString('hex').slice(0, 8);
