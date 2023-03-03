import { BaseTreeRepository } from "@/modules/database/crud";
import { CustomRepository } from "@/modules/database/decorators";
import { SelectQueryBuilder } from "typeorm";
import { MenuEntity } from "../entities";

@CustomRepository(MenuEntity)
export class MenuRepository extends BaseTreeRepository<MenuEntity> {
    protected alias = "menu";

    buildBaseQuery(qb: SelectQueryBuilder<MenuEntity>) {
        return qb.leftJoinAndSelect(`${this.alias}.p`, 'p')
                .leftJoinAndSelect(`${this.alias}.parent`, 'parent')
                .leftJoinAndSelect(`${this.alias}.children`, 'children')
    }
}