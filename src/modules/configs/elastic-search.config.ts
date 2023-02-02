import { ElasticsearchModuleOptions } from "@nestjs/elasticsearch";

export const elasticConfigFn = (): ElasticsearchModuleOptions => {
  return {
    node: 'http://localhost:9200',
    requestTimeout: 60000,
    maxRetries: 10,
    pingTimeout: 60000,
    sniffOnStart: true,
  }
}