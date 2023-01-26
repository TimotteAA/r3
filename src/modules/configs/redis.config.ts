import { RedisConfig } from "../utils";

/**
 * 可以创建多个redis链接，从而有多个mq
 */
export const redisConfigFn: () => RedisConfig = () => ({
  host: "localhost",
  port: 6379,
  name: "default"
})