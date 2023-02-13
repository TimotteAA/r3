import { SelectQueryBuilder, ObjectLiteral} from 'typeorm';
import { RedisOptions as IoRedisOptions} from "ioredis";
import { QueueOptions as BullMQOptions } from 'bullmq';
import Email from 'email-templates';
import { Attachment } from 'nodemailer/lib/mailer';
import dayjs from "dayjs"
import { JwtConfig, CaptchaConfig } from '../user/types';
import { DynamicRelation } from '../database/types';
import { GetCredentialOptions } from "qcloud-cos-sts"

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
 * database模块
 * 
 */


/**
 * 为queryBuilder添加查询的回调函数接口
 */
export type QueryHook<Entity> = (
    qb: SelectQueryBuilder<Entity>,
) => Promise<SelectQueryBuilder<Entity>>;

/**
 * 分页原数据
 */
export interface PaginateMeta {
    /**
     * 当前页项目数量
     */
    itemCount: number;
    /**
     * 项目总数量
     */
    totalItems?: number;
    /**
     * 每页显示数量
     */
    perPage: number;
    /**
     * 总页数
     */
    totalPages?: number;
    /**
     * 当前页数
     */
    currentPage: number;
}
/**
 * 分页选项
 */
export interface PaginateOptions {
    /**
     * 当前页数
     */
    page: number;
    /**
     * 每页显示数量
     */
    limit: number;
}

/**
 * 分页返回数据的类型
 */
export interface PaginateReturn<E extends ObjectLiteral> {
    meta: PaginateMeta;
    items: E[];
}

/**
 * 配置单个redis，可以用集群
 * 直接多个redis实例
 */
export type RedisOptions = IoRedisOptions | RedisOption[]

/**
 * ioredis链接配置
 * name不是哨兵节点
 * 此处用于表示某个redis实例
 */
export type RedisOption = Omit<IoRedisOptions, 'name'> & { name: string };



/**
 * BullMQ模块注册配置
 * name标识bull名称
 * 单个为default
 */
export type BullOptions = BullMQOptions | Array<{ name: string } & BullMQOptions>;

/**
 * 队列配置
 * name表示不同的队列
 * 单个为default
 */
export type QueueOptions = QueueOption | Array<{ name: string } & QueueOption>;

/**
 * 单个队列配置
 * 队列建立在哪个redis实例上
 * connection基于redis配置
 * redis属性为redis实例名称
 */
export type QueueOption = Omit<BullMQOptions, 'connection'> & { redis?: string };

/**
 * 空对象
 */
export type RecordNever = Record<never, never>;
/**
 * 获取数组中元素的类型
 */
export type ArrayItem<A> = A extends readonly (infer T)[] ? T : never;

/**
 * 嵌套对象
 */
export type NestedRecord = Record<string, Record<string, any>>;

/**
 * 腾讯云短信sdk配置
 */
export type SmsSdkOptions<T extends NestedRecord = RecordNever> = {
    secretId: string;
    secretKey: string;
    region: string;
    endpoint: string;
    sign: string;
    appid: string;
} & T


/**
 * SMTP邮件发送配置
 */
export type SmtpOptions<T extends NestedRecord = RecordNever> = {
    host: string;
    user: string;
    password: string;
    // Email模板总路径
    resource: string;
    from?: string;
    port?: number;
    secure?: boolean;
} & T;

/**
 * 公共发送接口配置
 */
export interface SmtpSendParams {
    // 模板名称
    name?: string;
    // 发信地址
    from?: string;
    // 主题
    subject?: string;
    // 目标地址
    to: string | string[];
    // 回信地址
    reply?: string;
    // 是否加载html模板
    html?: boolean;
    // 是否加载text模板
    text?: boolean;
    // 模板变量
    vars?: Record<string, any>;
    // 是否预览
    preview?: boolean | Email.PreviewEmailOpts;
    // 主题前缀
    subjectPrefix?: string;
    // 附件
    attachments?: Attachment[];
}


/**
 * 用户模块配置
 */
export interface UserConfig {
    // 加密算法位数，取10就好
    hash?: number;
    jwt: JwtConfig;
    captcha: CaptchaConfig;
    relations?: DynamicRelation[];
    // 超级管理员账户
    super: {
        username: string;
        password: string;
    }
}



/**
 * 构造器类型
 */
export type ClassType<T> = { new (...args: any[]): T };
// 类转普通对象类型，但是key和value保留
export type ClassToPlain<T> = { [key in keyof T]: T[key] };

/**
 * 核心模块配置
 */
export interface CoreModuleOptions {
    sms?: SmsSdkOptions;
    redis?: RedisOptions;
    smtp?: SmtpOptions;
    queue?: QueueOptions;
    cos?: CosStsOptions;
}

/**
 * 腾讯云获取临时授权的配置
 */
export type CosStsOptions = {
    credential: GetCredentialOptions;
    region: string;
    bucket: string;
    bucketPrefix: string;
}

