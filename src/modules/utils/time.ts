import dayjs from 'dayjs';
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
import { TimeOptions } from './types';
import { App } from '../core/app';
import { AppConfig } from '../core/types';

dayjs.extend(localeData);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(dayOfYear);

/**
 * 获取时间
 * @param options 
 */
export const getTime = async (options?: TimeOptions) => {
    if (!options) return dayjs();
    const { date, format, locale, strict, zonetime } = options;
    // 时区与local配置
    console.log(App.app)
    const config = await App.configure.get<AppConfig>("app")
    console.log("1231223123123132")

    // 每次创建一个新的时间对象
    // 如果没有传入local或timezone则使用应用配置
    const now = dayjs(date, format, locale ?? config.locale, strict).clone();
    return now.tz(zonetime ?? config.timezone);
};
