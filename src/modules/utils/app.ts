import { Global, Type, Module, ModuleMetadata } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { isNil, omit } from "lodash";

import { AppPipe, AppInterceptor, AppFilter } from "../core/providers";
import { CoreModule } from "../core/core.module";
import { CreateOptions, ModuleBuildMap, AppParams, ModuleItem, ModuleOption, ModuleBuilderMeta } from "../core/types";
import { DatabaseModule } from "../database/database.module";
import { ElasticSearchModule } from "../elastic/elastic-search.module";
import { QueueModule } from "../queue/queue.module";
import { RedisModule } from "../redis/redis.module";
import { RestfulModule } from "../restful/restful.module";
import { mergeMeta, CreateModule, isAsyncFunction } from "../core/helpers";
import { Configure } from "../core/configure";
import { MODULE_BUILDER_REGISTER } from "../core/constants";
import { App } from "../core/app";
import { Creator, CreatorData } from "../core/types";
import { TecendOsModule } from "../tencent-os/tecent-os.module";
import { SmtpModule } from "../smtp/smtp.module";
import { echoApi } from "../restful/helpers";
import { RestfulFactory } from "../restful/factory";

/**
 * 构建应用启动模块
 * @param params 
 * @param options 
 */
export async function createBootModule(
    params: AppParams,
    options: Pick<Partial<CreateOptions>, "meta" | "modules" | "globals">
): Promise<{ BootModule: Type<any>; modules: ModuleBuildMap }> {
    const { meta: bootMeta, modules, globals = {} } = options;
    const { configure } = params;
    const importModules = [...modules, CoreModule];
    if (configure.has("database")) importModules.push(DatabaseModule);
    if (configure.has("api")) importModules.push(RestfulModule);
    if (configure.has("redis")) {
        importModules.push(RedisModule);
        if (configure.has("queue")) {
            importModules.push(QueueModule)
        }
    }
    if (configure.has("sms") || configure.has("cos"))  importModules.push(TecendOsModule)
    if (configure.has("elastic")) importModules.push(ElasticSearchModule);
    if (configure.has("smtp")) importModules.push(SmtpModule);
    // 各个模块及其元数据
    const moduleMaps = await createImportModules(configure, importModules);
    // 相当于app.module导入的各个模块
    const imports: ModuleMetadata['imports'] = Object.values(moduleMaps).map((m) => m.module);
    const providers: ModuleMetadata['providers'] = [];
    if (globals.pipe !== null) {
        const pipe = globals.pipe
            ? globals.pipe(params)
            : new AppPipe({
                  transform: true,
                  forbidUnknownValues: false,
                  validationError: { target: false },
              });
        providers.push({
            provide: APP_PIPE,
            useValue: pipe,
        });
    }
    if (globals.interceptor !== null) {
        providers.push({
            provide: APP_INTERCEPTOR,
            useClass: globals.interceptor ?? AppInterceptor,
        });
    }
    if (globals.filter !== null) {
        providers.push({
            provide: APP_FILTER,
            useClass: AppFilter,
        });
    }
    if (!isNil(globals.guard)) {
        providers.push({
            provide: APP_GUARD, 
            useClass: globals.guard,
        });
    }
    return {
        BootModule: CreateModule("BootModule", () => {
            let meta: ModuleMetadata = {
                imports,
                providers
            }
            if (bootMeta) {
                meta = mergeMeta(meta, bootMeta(params))
            };
            return meta;
        }),
        modules: moduleMaps
    }
}

/**
 * 针对所有的导入模块，创建出模块及其metdata的map
 * @param configure 
 * @param modules 
 */
async function createImportModules(
    configure: Configure,
    modules: ModuleItem[]
): Promise<ModuleBuildMap> {
    const maps: ModuleBuildMap = {};
    // console.log(chalk.red("import modules"), modules)
    for (const m of modules) {
        // 同一类型
        const option: ModuleOption = "module" in m ? m : { module: m }
        const metadata: ModuleBuilderMeta = await getModuleMeta(configure, option);
        // console.log("module", m);
        // 执行模块装饰器
        // console.log("module", m, "metadata", metadata);
        Module(omit(metadata, ['global']))(option.module);
        if (metadata.global) Global()(option.module);
        maps[option.module.name] = { module: option.module, meta: metadata }
    };
    return maps;
}

async function getModuleMeta(configure: Configure, option: ModuleOption) {
    let metadata: ModuleBuilderMeta = {};
    // 定义在模块类上的module builder
    const register = Reflect.getMetadata(MODULE_BUILDER_REGISTER, option.module);
    const params = option.params ?? {};
    if (!isNil(register)) {
        metadata = isAsyncFunction(register) ?
            await register(configure, params)
            : register(configure, params);
    }
    return metadata;
}

export function createApp(options: CreateOptions): Creator {
    return async () => App.create(options);
}

export async function boot(
    creator: () => Promise<CreatorData>,
) {
    const { app } = await creator();
    const configure = app.get(Configure);
    const host = await configure.get<string>("app.host");
    const port = await configure.get<number>("app.port");
    await app.listen(port, host, (err, address) => {
        // 输出文档
        const configure = app.get(Configure);
        const rest = app.get(RestfulFactory)
        echoApi(configure, rest)
    });
}