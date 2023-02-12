import { Injectable } from "@nestjs/common";

import { BaseRepository } from "@/modules/core/crud";
import { MediaEntity } from "../entities";
import { CustomRepository } from "@/modules/database/decorators";

@Injectable()
@CustomRepository(MediaEntity)
export class MediaRepository extends BaseRepository<MediaEntity> {
  protected alias = "media";

  buildBaseQuery() {
    return this.createQueryBuilder(this.alias).orderBy(`${this.alias}.createdAt`, "DESC");
  }
}