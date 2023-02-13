import { forwardRef, Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";

import { UserModule } from "../user/user.module";
import { addEntities } from "../database/helpers";
import * as entityMaps from "./entities";
import * as repoMaps from "./repositorys"
import * as serviceMaps from "./service";

const entities = Object.values(entityMaps);
const repos = Object.values(repoMaps);
const services = Object.values(serviceMaps);

@Module({
  imports: [addEntities(entities), 
    DatabaseModule.forRepository(repos), 
    forwardRef(() => UserModule)],
  providers: [
    ...services
  ],
  exports: [DatabaseModule.forRepository(repos), ...services]
})
export class MediaModule {}