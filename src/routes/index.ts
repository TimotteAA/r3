import { env } from "../modules/utils";
import { ApiConfig } from "../modules/restful/types";
import { v1 } from "./v1";
import { Configure } from "../modules/core/configure";

export const api = async (configure: Configure): Promise<ApiConfig> => ({
    title: env("APP_TITLE", "个人博客"),
    description: env("APP_DESCRIPTION", "TS开发的全栈博客"),
    auth: true,
    prefix: { doc: "api-docs", route: "api" },
    default: env("APP_DEFAULT_VERSION", "v1"),
    enabled: [],
    versions: { v1: await v1(configure) }
})