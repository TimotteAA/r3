import { ModuleBuilder } from "../core/decorators";
import { RestfulFactory } from "./factory";
import { ApiConfig } from "./types";

@ModuleBuilder(async (configure) => {
    const api = await configure.get<ApiConfig>("api");
    const restful = new RestfulFactory(configure);
    // 创建路由，创建文档，但是没有输出
    await restful.create(api);
    return {
        global: true,
        imports: restful.getModuleImports(),
        providers: [
            {
                provide: RestfulFactory,
                useValue: restful
            }
        ],
        exports: [RestfulFactory]
    }
})
export class RestfulModule {}