import { ModuleMetadata, Type, PipeTransform } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { IAuthGuard } from '@nestjs/passport';

import { Configure } from './configure';

// App类型配置

export interface AppConfig {
    /**
     * 主机地址,默认为127.0.0.1
     */
    host: string;
    /**
     * 监听端口,默认3100
     */
    port: number;
    /**
     * 是否开启https,默认false
     */
    https: boolean;
    /**
     * 时区,默认Asia/Shanghai
     */
    timezone: string;
    /**
     * 语言,默认zh-cn
     */
    locale: string;
    /**
     * 是否启用websockets服务
     */
    websockets: boolean;
    /**
     * 是否为服务器运行状态(无法设置,通过指定SERVER环境变量使用,默认false)
     */
    server: boolean;
    /**
     * 服务运行的协议+host+port
     * buildConfigure中生成
     */
    url?: string;
    /**
     * 由url+api前缀生成的基础api url
     */
    api?: string;
}

/**
 * BootModule启动模块的入参
 */
export type AppParams = {
    /**
     * 模块的配置实例
     */
    configure?: Configure;
    /**
     * app实例
     */
    app?: NestFastifyApplication
}

/**
 * 应用构建器
 */
export interface AppBuilder {
    (params: { configure: Configure; BootModule: Type<any> }): Promise<NestFastifyApplication>
}

/**
 * 创建app的具体配置
 */
export interface CreateOptions {
    /**
     * app构建器
     */
    builder: AppBuilder;
    /**
     * 初始配置集
     */
    configs: Record<string, any>;
    /**
     * 全局配置：管道、guard、filter、interceptor
     */
    globals?: {
        /**
         * 全局管道,默认为AppPipe,设置为null则不添加
         * @param params
         */
        pipe?: (params: AppParams) => PipeTransform<any> | null;
        /**
         * 全局拦截器,默认为AppInterceptor,设置为null则不添加
         */
        interceptor?: Type<any> | null;
        /**
         * 全局过滤器,默认AppFilter,设置为null则不添加
         */
        filter?: Type<any> | null;
        /**
         * 全局守卫
         */
        guard?: Type<IAuthGuard>;
    };

    /**
     * 配置服务的动态存储选项
     */
    configure?: ConfigStorageOption;
    /**
     * 除却database、core、rest的模块
     * cos、sms、smtp、redis、queue这些模块配置在了createBootModule中
     * 一些核心模块,比如DatabaseModule,RestfulMuodle,CoreModule等无需在此处添加
     * 他们会根据配置自动添加
     */
    modules?: ModuleItem[];
    /**
     * 为启动模块添加一些自定义的ModuleMetaData数据
     * @param params
     */
    meta?: (params: AppParams) => ModuleMetadata;
}

/**
 * 创建应用后返回的对象
 */
export interface CreatorData extends Required<AppParams> {
    modules: ModuleBuildMap;
}

/**
 * 应用创建函数
 */
export interface Creator {
    (): Promise<CreatorData>;
}

/**
 * 单一模块的类型
 */
export type ModuleItem = Type<any> | ModuleOption;

/**
 * 为模块加一些额外的参数,可以在构造模块时获取
 */
export type ModuleOption = { module: Type<any>; params?: Record<string, any> }

/**
 * 模块构建表：模块名，模块类，元数据
 */
export type ModuleBuildMap = Record<string, { meta: ModuleBuilderMeta; module: Type<any> }>

/**
 * 简单配置器注册函数
 */
export type ConfigureRegister<T extends Record<string, any>> = (
    configure: Configure
) => T | Promise<T>;

/**
 * 复杂配置器工厂
 */
export interface ConfigureFactory<
    T extends Record<string, any>,
    C extends Record<string, any> = T
> {
    /**
     * 简单配置注册器
     */
    register: ConfigureRegister<RePartial<T>>;
    /**
     * 默认注册配置器，与上面的合并
     */
    defaultRegister?: ConfigureRegister<T>;
    /**
     * 是否存储在yml中
     */
    storage?: boolean;
    /**
     * 回调函数
     * @param configure 配置类服务实例 
     * @param value 配置器注册器register执行后的返回值
     */
    hook?: (configure: Configure, value: T) => C | Promise<C>;
    /**
     * 深度合并时数组是否采用追加模式，默认false
     */
    append?: boolean;
}

/**
 * 配置服务的yaml动态存储选项
 */
export interface ConfigStorageOption {
    /**
     * 是否开启动态存储
     */
    storage?: boolean;
    /**
     * yaml文件路径，默认为dist目录外的config.yml
     */
    ymlPath?: string;
}

/**
 * 每个模块构造器的元数据：imports、exports..
 */
export type ModuleBuilderMeta = ModuleMetadata & {
    global?: boolean;
}

/**
 * 每个模块元数据工厂
 */
export type ModuleMetaRegister<P extends Record<string, any>> = (
    configure: Configure,
    params: P,
) => ModuleBuilderMeta | Promise<ModuleBuilderMeta>;

export type ConnectionOption<T extends Record<string, any>> = { name?: string } & T;
export type ConnectionRst<T extends Record<string, any>> = ({name: string} & T)[]