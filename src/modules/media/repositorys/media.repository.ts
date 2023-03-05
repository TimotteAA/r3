import { Injectable } from "@nestjs/common";

import { BaseRepository } from "@/modules/database/crud";
import { BaseFileEntity } from "../entities";
import { CustomRepository } from "@/modules/database/decorators";

@Injectable()
@CustomRepository(BaseFileEntity)
export class MediaRepository extends BaseRepository<BaseFileEntity> {
    protected alias = "media";

    buildBaseQuery() {
        return this.createQueryBuilder(this.alias).orderBy(`${this.alias}.createdAt`, "ASC");
    }
}