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
export const getTime = (options?: TimeOptions) => {
  if (!options) return dayjs();
  const { date, format, locale, strict, zonetime } = options;
  const config = {
      // 默认时区
      timezone: 'Asia/Shanghai',
      // 默认语言
      locale: 'zh-cn',
  }
  // 每次创建一个新的时间对象
  // 如果没有传入local或timezone则使用应用配置
  const now = dayjs(date, format, locale ?? config.locale, strict).clone();
  return now.tz(zonetime ?? config.timezone);
};
