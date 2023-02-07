import bcrypt from 'bcrypt';
import { userConfigFn } from '../configs';
import crypto from 'crypto';



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
