import { BaseRepository } from "@/modules/database/crud";
import { ActionEntity } from "../entities";
import { CustomRepository } from "@/modules/database/decorators";

@CustomRepository(ActionEntity)
export class ActionRepository extends BaseRepository<ActionEntity> {
    protected alias = "action";

    buildBaseQuery() {
        return this.createQueryBuilder(this.alias)
    }
}
