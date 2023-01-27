import { isNil, omit } from "lodash";
import { RedisOption, RedisOptions, QueueOptions, BullOptions } from "./types"

/**
 * 调和redis配置
 * @param options 
 */
export const createRedisOptions = (options: RedisOptions) => {
  // name是为了ma获得redis实例，默认是default
  const config: Array<RedisOption> = Array.isArray(options) ? options : [{...options, name: "default"}]
  if (config.length <= 0) return undefined;
  // 不包含name为default的配置，指定第一个是
  if (isNil(config.find(({name}) => name === "default"))) {
    config[0].name = "default"
  }
  return config.reduce<RedisOption[]>((o, n) => {
    const names = o.map(({name}) => name) as string[];
    // 防止name重复
    return names.includes(n.name) ? o : [...o, n];
  }, [])
}

export const createQueueOptions = (options: QueueOptions, redis: RedisOption[]): BullOptions | undefined => {
  const names = redis.map(({name}) => name);
  // 没有default的redis配置
  if (redis.length <= 0 && !names.includes("default")) return undefined;
  // 一个queue配置
  if (!Array.isArray(options)) {
    return {
      ...omit(options, "redis"),
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