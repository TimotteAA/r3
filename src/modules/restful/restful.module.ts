import { DynamicModule } from "@nestjs/common";
// import { Configure } from "../core/Configure";

import { RestfulFactory } from "./factory";
import { ApiConfig } from "./types";

export class RestfulModule {
  static async forRoot(config: ApiConfig): Promise<DynamicModule> {
    const restful = new RestfulFactory();
    restful.create(config)
    
    console.log(restful.getModuleImports())
    console.log(restful.modules)
    
    return {
      global: true,
      imports: restful.getModuleImports(),
      providers: [
        {
          provide: RestfulFactory,
          useValue: restful
        }
      ],
      module: RestfulModule,
      exports: [RestfulFactory]
    }
  }
}