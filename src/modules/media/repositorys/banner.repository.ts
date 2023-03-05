import { Injectable } from "@nestjs/common";

import { BaseRepository } from "@/modules/database/crud";
import { CustomRepository } from "@/modules/database/decorators";
import { BannerEntity } from "../entities";

@Injectable()
@CustomRepository(BannerEntity)
export class BannerRepository extends BaseRepository<BannerEntity> {
    protected alias = "banner";

    buildBaseQuery() {
        return this.createQueryBuilder(this.alias)
            .leftJoinAndSelect(`${this.alias}.image`, "image")
            .orderBy(`${this.alias}.createdAt`, "ASC");
    }
}