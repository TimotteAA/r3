import { loadEnvs, setEnv } from "../utils/env";

loadEnvs()
setEnv();

export * from "./database.config";
export * from "./user.config"
export * from "./redis.config"
export * from "./queue.config"
export * from "./sms.config"
export * from "./smtp.config";