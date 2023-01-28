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

export const generateRandonString = () => crypto.randomBytes(4).toString('hex').slice(0, 8);
