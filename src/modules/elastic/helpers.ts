import { ElasticsearchModuleOptions } from "@nestjs/elasticsearch";

import { ConfigureFactory, ConfigureRegister } from "../core/types";

export const createESConfig: (
    register: ConfigureRegister<ElasticsearchModuleOptions>
) => ConfigureFactory<ElasticsearchModuleOptions, ElasticsearchModuleOptions> = (register) => ({
    register,
    defaultRegister: (configure) => ({
        node: configure.env("ES_NODE", "http://localhost:9200"),
        requestTimeout: configure.env("ES_REQUEST_TIMEOUT", 6000),
        maxRetries: configure.env("ES_MAX_RETRIES", 10),
        pingTimeout: configure.env("ES_PING_TIMEOUT", 60000),
        sniffOnStart: configure.env("ES_SNIFF_ON_START", true),
    })
})
