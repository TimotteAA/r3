import { SmsSdkOptions } from "../utils";
import { env } from "../utils";

export const smsConfigFn: () => SmsSdkOptions = () => {
  return {
    secretId: env("secretId"),
    secretKey: env("secretKey"),
    region: env("SMS_regioncl"),
    endpoint: env("endpoint"),
    sign: env("sign"),
    appid: env("appid")
  }
}