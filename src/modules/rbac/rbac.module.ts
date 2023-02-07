import { Module } from "@nestjs/common";
import { addEntities } from "../database/helpers";
import { DatabaseModule } from "../database/database.module";

import * as entityMaps from "./entities";
import * as repoMaps from "./repository";

const entities = Object.values(entityMaps);
const repos = Object.values(repoMaps);

@Module({
  imports: [addEntities(entities), DatabaseModule.forRepository(repos)]
})
export class RbacModule {}