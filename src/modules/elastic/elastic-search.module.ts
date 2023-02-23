import { ElasticsearchModule, ElasticsearchModuleOptions } from "@nestjs/elasticsearch";

import { ModuleBuilder } from "../core/decorators";

@ModuleBuilder(async (configure) => {
    const options = await configure.get<ElasticsearchModuleOptions>("elastic")
    return {
      global: true,
      // module: ElasticSearchModule,
      imports: [
        ElasticsearchModule.register(options)
      ],
      exports: [
        ElasticsearchModule
      ]
    }
})
export class ElasticSearchModule {}