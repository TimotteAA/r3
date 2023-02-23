import { forwardRef } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { UserModule } from "../user/user.module";
import { addEntities } from "../database/helpers";
import { AvatarEntity } from "./entities";
import * as repoMaps from "./repositorys"
import * as serviceMaps from "./service";
import { ModuleBuilder } from "../core/decorators";


// const entities = Object.values(entityMaps);
const repos = Object.values(repoMaps);
const services = Object.values(serviceMaps);

@ModuleBuilder(async configure => {
  await configure.sync("database")
  // console.log(await configure.get("database"))
  
  return {
    imports: [
      (await addEntities(configure, [AvatarEntity])), 
      DatabaseModule.forRepository(repos), 
      forwardRef(() => UserModule)
    ],
    providers: [
      ...services,
    ],
    exports: [DatabaseModule.forRepository(repos), ...services]
  }
})
export class MediaModule {}