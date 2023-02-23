import { env } from "../utils";
import { ApiConfig } from "../restful/types";
import { v1 } from "./v1";

export const api = (): ApiConfig => ({
  title: env("APP_TITLE"),
  description: env("APP_DESCRIPTION"),
  auth: true,
  prefix: { doc: "docs", route: "" },
  default: env("APP_DEFAULT_VERSION"),
  enabled: [],
  versions: { v1 }
})