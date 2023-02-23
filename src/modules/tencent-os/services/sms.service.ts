import { Injectable } from "@nestjs/common";
import * as tencentcloud from "tencentcloud-sdk-nodejs";
import { SendSmsRequest } from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_models';

import { SmsSdkOptions} from "../types";
import { deepMerge } from "@/modules/utils";


const smsClient = tencentcloud.sms.v20210111.Client

// type SendParams = Omit<Partial<SendSmsRequest>, "SmsSdkAppId" | "SignName">

@Injectable()
export class SmsService {
  constructor(protected options: SmsSdkOptions) {}

  /**
   * 创建发信客户端
   */
  protected makeClient(options: SmsSdkOptions) {
    const { secretId, secretKey, region, endpoint  } = options;
    // console.log("region", region)
    return new smsClient({
      credential: {
        secretId,
        secretKey,
      },
      region,
      profile: {
        httpProfile: {
          endpoint
        }
      }
    })
  }

  /**
   * 发送短信
   * @param params 
   * @param options 
   */
  async send(params: SendSmsRequest, options?: SmsSdkOptions) {
    // console.log("params", params);
    const settings = deepMerge(this.options, options ?? {}) as SmsSdkOptions;
    // console.log("settings", settings);
    const client = this.makeClient(settings);
    // console.log({...params, SmsSdkAppId: settings.appid, SignName: settings.sign})
    const res = await client.SendSms({...params, SmsSdkAppId: settings.appid, SignName: settings.sign})
    return res;
  }
}