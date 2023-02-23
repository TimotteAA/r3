import { Injectable } from "@nestjs/common"
import { extname } from "path";
import { isNil } from "lodash";

import { AvatarRepository } from "../repositorys"
import { AvatarEntity } from "../entities"
import { BaseService } from "@/modules/database/crud"
import { CosService } from "@/modules/tencent-os/services"
import { CreateFileOptions } from "../types"
import { DataSource, ObjectLiteral } from "typeorm"
import { UserService } from "@/modules/user/services";

@Injectable()
export class AvatarService extends BaseService<AvatarEntity, AvatarRepository> {
  constructor(protected repo: AvatarRepository,
    protected userService: UserService,
    protected cosService: CosService,
    protected dataSource: DataSource
  ) {
    super(repo)
  }

  /**
   * 上传单一文件
   * @param data 
   */
  async upload<E extends ObjectLiteral>(data: CreateFileOptions<E>) {
    const { file, user, relation, description } = data;
    const mediaEntity = new AvatarEntity();
    // oss存储key
    const ossKey = this.cosService.generateKey(file.filename);

    mediaEntity.key = ossKey;
    mediaEntity.ext = extname(ossKey);
    mediaEntity.description = description;
    console.log("user before")
    if (!isNil(user)) {
      mediaEntity.user = await this.userService.detail(user.id)
    };
    // 上传到阿里云oss中
    const res = await this.cosService.upload(file, ossKey);
    // console.log(1235661241412);
    // 处理关联关系: user的avatar
    if (!isNil(relation)) {
      const { entity, id } = relation;
      // 默认别的表，关联到media表的是image字段
      let field = "image"
      if (!isNil(relation.field)) field = relation.field;
      // userRepo
      const relationRepo = this.dataSource.getRepository(entity)
      // user entity
      const relationEntity = await relationRepo.findOneOrFail({
        where: {
          id
        } as any,
        relations: [field]
      });
      // 之前保存的oldMedia
      const oldMedia = !isNil(relationEntity[field]) ? await this.repo.findOneByOrFail({
        id: (relationEntity[field] as any).id
      }) : null;
      // 先拿到老的再保存新的
      await AvatarEntity.save(mediaEntity);
      // console.log("oldMedia", oldMedia)
      // 更新新的entity关系
      // user.avatar = new avatar
      console.log("relationEntity", relationEntity)
      await relationRepo.update(relationEntity.id, {
        [field]: mediaEntity
      } as any)
      // 删除老的entity
      await oldMedia.remove()

      // 到oss中删除
      if (!isNil(oldMedia)) {
        await this.cosService.delete(oldMedia.key);
      }
    } else {
      await AvatarEntity.save(mediaEntity);
    }
    
    // 返回结果
    return res;
  }
}