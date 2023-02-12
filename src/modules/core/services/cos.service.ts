import { CosStsOptions } from "@/modules/utils";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import STS from "qcloud-cos-sts";
import COS from "cos-nodejs-sdk-v5";
import { env } from "@/modules/utils";

@Injectable()
export class CosService {
  protected config: CosStsOptions;
  protected cos: COS;

  constructor(config: CosStsOptions) {
    this.config = config;
  }
  
  async upload(body: Buffer, mimetype: string) {
    this.cos = await this.setCOS();
    console.log("mimetype", mimetype);
    // 文件名不可少
    const res = await this.cos.putObject({
      Bucket: env("BUCKET"), 
      Region: env("REGION"),   
      Key: 'blog/avatar/exampleobject.jpeg',             
      StorageClass: 'MAZ_STANDARD',
      Body: body,
      ContentEncoding: mimetype
    });
    console.log("res", res);
    return res;
  }

  /**
   * 获取cos临时凭证
   */
  protected async getCredential() {
    let res: any;
    // console.log(this.config.credential)
    try {
      res = await STS.getCredential(this.config.credential);
    } catch (err) {
      throw new InternalServerErrorException({}, "获取凭证失败，请联系服务器管理员")
    } finally {
      console.log("获取凭证", res);
    }
    return res;
  }



  protected async setCOS() {
    const getCredential = this.getCredential.bind(this);
    return new COS({
      async getAuthorization(_options, callback) {
        // 获取临时密钥
        const res = await getCredential();
        const auth = {
          TmpSecretId: res.credentials.tmpSecretId,        // 临时密钥的 tmpSecretId
          TmpSecretKey: res.credentials.tmpSecretKey,      // 临时密钥的 tmpSecretKey
          SecurityToken: res.credentials.sessionToken, // 临时密钥的 sessionToken
          ExpiredTime: res.expiredTime,    
          StartTime: res.startTime        // 临时密钥失效时间戳，是申请临时密钥时，时间戳加 durationSecon
        };
        callback(auth);
      },
      FileParallelLimit: 3,
      ChunkParallelLimit: 8,
      ChunkSize: 1024 * 1024 * 8, // 分块字节数
    })
  }
}