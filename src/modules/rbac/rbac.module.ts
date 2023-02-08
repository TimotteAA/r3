import { DataSource } from "typeorm";
import { forwardRef, Module } from "@nestjs/common";
import { getDataSourceToken } from "@nestjs/typeorm";

import { addEntities } from "../database/helpers";
import { DatabaseModule } from "../database/database.module";
import * as entityMaps from "./entities";
import * as repoMaps from "./repository";
import * as subscriberMaps from "./subscribers";
import * as serviceMaps from "./services";
import { RbacResolver } from "./rbac.resolver";
import { UserModule } from "../user/user.module";

const entities = Object.values(entityMaps);
const repos = Object.values(repoMaps);
const subscribers = Object.values(subscriberMaps);
const services = Object.values(serviceMaps);

@Module({
  imports: [addEntities(entities), DatabaseModule.forRepository(repos), forwardRef(() => UserModule)],
  providers: [...subscribers, ...services,         
    {
      provide: RbacResolver,
      useFactory: async (dataSource: DataSource) => {
          const resolver = new RbacResolver(dataSource);
          resolver.setOptions({});
          return resolver;
      },
      inject: [getDataSourceToken()],
    }
  ],
  exports: [DatabaseModule.forRepository(repos), ...services, RbacResolver]
})
export class RbacModule {
  onModuleInit() {
    // console.log(1);
  }
}