
import dayjs from "dayjs"

import { ApiConfig } from '../restful/types';

/**
 * 时间配置
 */
export interface TimeOptions {
    date?: dayjs.ConfigType;
    format?: dayjs.OptionType;
    locale?: string;
    strict?: boolean;
    zonetime?: string;
}



/**
 * 核心模块配置
 */
export interface CoreModuleOptions {
    // sms?: SmsSdkOptions;
    // smtp?: SmtpOptions;
    // queue?: QueueOptions;
    // cos?: CosStsOptions;
    api?: ApiConfig 
}


