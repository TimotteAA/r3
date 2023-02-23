import { omit } from "lodash";

import { ConfigureRegister, ConfigureFactory } from "../core/types";
import { RedisConfig, RedisConnectionOption } from "../redis/types";

import { QueueOptions, QueueConfig } from "./types";

export const createQueueConfig: (
    register: ConfigureRegister<QueueOptions>
) => ConfigureFactory<QueueOptions, QueueConfig | undefined> = (register) => ({
    register,
    hook: async (configure, value) => 
        createQueueOptions(value, await configure.get<RedisConfig>("redis")),
    defaultRegister: (configure) => ({
        redis: configure.env("QUEUE_REDIS_NAME", "default")
    })
})

export const createQueueOptions = async (
    options: QueueOptions,
    redis: Array<RedisConnectionOption> | undefined,
): Promise<QueueConfig | undefined> => {
    const names = redis.map(({name}) => name);
    // 没有default的redis配置
    if (redis.length <= 0 && !names.includes("default")) return undefined;
    // 一个queue配置
    if (!Array.isArray(options)) {
      return {
        ...omit(options, "redis"),
        // 找到指定name的redis配置项
        connection: redis.find(({name}) => name === options.redis ?? "default")
      }
    }
    return options.map(({name, redis: r}) => {
      return {
        name,
        ...omit(options, "redis"),
        connection: redis.find(({name}) => name === r ?? "default")
      }
    })
}