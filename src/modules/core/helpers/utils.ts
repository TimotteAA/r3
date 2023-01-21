import { isNil } from 'lodash';

/**
 * 对请求的入参（可能是字符串或者boolean)进行转换
 * @param value
 * @returns
 */
export function toBoolean(value?: string | boolean): boolean {
    if (isNil(value)) return false;
    if (typeof value === 'boolean') return value;
    try {
        return JSON.parse(value.toLowerCase());
    } catch (e) {
        return value as unknown as boolean;
    }
}
