import { Injectable } from "@nestjs/common";
import { deepMerge, SmsSdkOptions} from "@/modules/utils";
import * as tencentcloud from "tencentcloud-sdk-nodejs";
import { SendSmsRequest } from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_models';


const smsClient = tencentcloud.sms.v20210111.Client

@Injectable()
export class SmsService {
  constructor(protected options: SmsSdkOptions) {}

  /**
   * 创建发信客户端
   */
  protected makeClient(options: SmsSdkOptions) {
    const { secretId, secretKey, region, endpoint  } = options;
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
    const settings = deepMerge(this.options, options ?? {}) as SmsSdkOptions;
    const client = this.makeClient(settings);
    return client.SendSms(params)
  }
}