import { CosStsOptions, env } from "../utils";

export const cqsConfigFn = (): CosStsOptions => ({
  credential: {
    secretId: env("SECRET_ID"),
    secretKey: env("SECRET_KEY"),
    policy: {
      "version": "2.0",
      "statement": [{
              "action": [
                  "name/cos:PutObject",
                  "name/cos:PostObject",
                  "name/cos:InitiateMultipartUpload",
                  "name/cos:ListMultipartUploads",
                  "name/cos:ListParts",
                  "name/cos:UploadPart",
                  "name/cos:CompleteMultipartUpload",     
                  "name/cos:AbortMultipartUpload"
              ],
              "effect": "allow",
              "resource": [
                `qcs::cos:${env("REGION")}:uid/${env("APP_ID")}:${env("BUCKET")}/${env("ALLOW_PREFIX")}/*`
              ]
          },
          {
              "action": [
                  "name/cos:GetObject"
              ],
              "effect": "allow",
              "resource": [
                `qcs::cos:${env("REGION")}:uid/${env("APP_ID")}:${env("BUCKET")}/${env("ALLOW_PREFIX")}/*`
              ]
          },
          {
            "action": [
                "name/cos:DeleteObject",
            ],
            "effect": "allow",
            "resource": [
              `qcs::cos:${env("REGION")}:uid/${env("APP_ID")}:${env("BUCKET")}/${env("ALLOW_PREFIX")}/*`
            ]
        },
      ]
    }
  },
  region: env("REGION"),
  bucket: env("BUCKET"),
  // bucker文件路径
  bucketPrefix: env("URL_PREFIX")
})