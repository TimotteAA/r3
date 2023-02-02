import { DynamicModule, Module } from "@nestjs/common";
import { ElasticsearchModule, ElasticsearchModuleOptions } from "@nestjs/elasticsearch";

@Module({})
export class ElasticSearchModule {
  static forRoot(options: ElasticsearchModuleOptions): DynamicModule {
    return {
      global: true,
      module: ElasticSearchModule,
      imports: [
        ElasticsearchModule.register(options)
      ],
      exports: [
        ElasticsearchModule
      ]
    }
  }
}