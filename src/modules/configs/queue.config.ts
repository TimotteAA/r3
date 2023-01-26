import { QueueOptions } from "@/modules/utils";

/**
 * 默认用default redis
 */
export const queueConfigFn: () => QueueOptions = () => {
  return {
    redis: "default"
  }
}