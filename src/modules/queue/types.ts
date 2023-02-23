import { QueueOptions as BullMQOptions } from 'bullmq';

/**
 * 模块配置
 */
export type QueueConfig = BullMQOptions | Array<{ name: string } & BullMQOptions>;

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
 * redis属性为服务器的redis实例名称
 */
export type QueueOption = Omit<BullMQOptions, 'connection'> & { redis?: string };