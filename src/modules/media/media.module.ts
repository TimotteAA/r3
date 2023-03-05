import { forwardRef } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { UserModule } from "../user/user.module";
import { addEntities } from "../database/helpers";
import * as entityMaps from "./entities";
import * as repoMaps from "./repositorys"
import * as serviceMaps from "./service";
import * as subscribeMaps from "./subscribers";
import { ModuleBuilder } from "../core/decorators";
import { CoreModule } from "../core/core.module";
import { TecentOsModule } from "../tencent-os/tecent-os.module";


// const entities = Object.values(entityMaps);
const repos = Object.values(repoMaps);
const services = Object.values(serviceMaps);

@ModuleBuilder(async configure => {
  await configure.sync("database")
  
  return {
    imports: [
      (await addEntities(configure, Object.values(entityMaps))), 
      DatabaseModule.forRepository(repos), 
      forwardRef(() => UserModule),
      CoreModule,
      TecentOsModule
    ],
    providers: [
      ...services,
      ...Object.values(subscribeMaps)
    ],
    exports: [DatabaseModule.forRepository(repos), ...services]
  }
})
export class MediaModule {}