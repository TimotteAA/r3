import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";

import { addEntities } from "../database/helpers";
import * as entityMaps from "./entities";
import * as repoMaps from "./repositorys"

const entities = Object.values(entityMaps);
const repos = Object.values(repoMaps);

@Module({
  imports: [addEntities(entities), DatabaseModule.forRepository(repos)],
  providers: [

  ],
  exports: [DatabaseModule.forRepository(repos)]
})
export class MediaModule {}