import { Injectable } from "@nestjs/common";
import { extname } from "path";
import { isNil } from "lodash";
import { DataSource, ObjectLiteral } from "typeorm";

import { MediaRepository } from "../repositorys";
import { BaseFileEntity } from "../entities";
import { BaseService } from "@/modules/database/crud";
import { CreateFileOptions } from "../types";
import { CosService } from "@/modules/tencent-os/services";

@Injectable()
export class MediaService extends BaseService<BaseFileEntity, MediaRepository> {
    constructor(
        protected repo: MediaRepository,
        protected cosService: CosService,
        protected dataSource: DataSource
    ) {
        super(repo)
    }
    
    /**
     * 上传单张文件
     * @param data 
     */
    async upload<E extends ObjectLiteral>(data: CreateFileOptions<E>, bucketPrefix: string) {
        const { file, relation } = data;
        const item = new BaseFileEntity();

        const ossKey = await this.cosService.generateKey(file.filename);
        item.key = ossKey;
        item.ext = extname(ossKey);
        item.bucketPrefix = bucketPrefix;

        await BaseFileEntity.save(item);
        // 上传图片到oss中
        await this.cosService.upload(file, bucketPrefix, ossKey);

        // 处理关联关系
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
            // 老的关联的media
            const oldMedia = !isNil(relationEntity[field]) ? await this.repo.findOneByOrFail({
                id: (relationEntity[field] as any).id
              }) : null;

            // 保存新的
            await relationRepo 
                    .createQueryBuilder()
                    .relation(entity, field)
                    .of(relationEntity)
                    .set(item)

            // 处理老的
            if (!isNil(oldMedia)) {
                await this.cosService.delete(bucketPrefix, oldMedia.key);
            }
        }

        return this.repo.findOneByOrFail({ id: item.id });
    }   
}