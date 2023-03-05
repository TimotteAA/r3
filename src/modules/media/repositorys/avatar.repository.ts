import { Injectable } from "@nestjs/common";

import { BaseRepository } from "@/modules/database/crud";
import { AvatarEntity } from "../entities";
import { CustomRepository } from "@/modules/database/decorators";

@Injectable()
@CustomRepository(AvatarEntity)
export class AvatarRepository extends BaseRepository<AvatarEntity> {
    protected alias = "avatar";

    buildBaseQuery() {
        return this.createQueryBuilder(this.alias)
              .leftJoinAndSelect(`${this.alias}.user`, "user")
              .orderBy(`${this.alias}.createdAt`, "ASC");
    }
}