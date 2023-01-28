import { QueueOptions } from "@/modules/utils";

/**
 * 默认用default的redis配置
 */
export const queueConfigFn: () => QueueOptions = () => {
  return {
    redis: "default"
  }
}