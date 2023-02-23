import { createRedisConfig } from "../redis/helpers";

export const redis = createRedisConfig((configure) => ({
    host: configure.env("REDIS_HOST", "127.0.0.1"),
    port: configure.env("REDIS_PORT", 6379)
}))