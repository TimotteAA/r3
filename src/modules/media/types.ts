import { MultipartFile } from "@fastify/multipart";
import { ObjectLiteral, EntityTarget } from "typeorm";

import { ClassToPlain } from "../utils";
import { UserEntity } from "../user/entities";

/**
 * 上传单一文件的类型
 */
export interface CreateFileOptions<E extends ObjectLiteral> {
  /**
   * 上传的文件
   */
  file: MultipartFile;
  /**
   * 文件的用户
   */
  user?: ClassToPlain<UserEntity>;
  /**
   * 与文件关联的另一张表
   */
  relation?: {
    /**
     * 关联表的id
     */
    id: string;
    /**
     * 关联模型
     */
    entity: EntityTarget<E>;
    /**
     * 关联字段：user表中的avatar
     */
    field?: string;
  }
  /**
   * 文件描述
   */
  description?: string;
}
