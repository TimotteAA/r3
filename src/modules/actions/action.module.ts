import { ContentModule } from "../content/content.module";
import { ModuleBuilder } from "../core/decorators";
import { addEntities } from "../database/helpers";
import { UserModule } from "../user/user.module";
import { ActionEntity } from "./entities";
import { DatabaseModule } from "../database/database.module";

import * as repoMaps from "./repositorys";
import * as serviceMaps from "./services";

@ModuleBuilder(async (configure) => ({
    imports: [
        await addEntities(configure, [ActionEntity]),
        UserModule,
        ContentModule,
        DatabaseModule.forRepository(Object.values(repoMaps))
    ],
    providers: [
        ...Object.values(serviceMaps)
    ],
    exports: [
        DatabaseModule.forRepository([...Object.values(repoMaps)]),
        ...Object.values(serviceMaps)
    ]
}))
export class ActionModule {}