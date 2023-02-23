import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { WsAdapter } from "@nestjs/platform-ws";
import { useContainer } from "class-validator";
import { Configure } from "./configure";
import { ConfigStorageOption, CreateOptions } from "./types";
import { createBootModule } from "../utils/app";

export class App {
    /**
     * 应用配置实例
     */
    protected static _configure: Configure;

    /**
     * 应用实例
     */
    protected static _app: NestFastifyApplication;

    static get configure(): Configure {
        return this._configure ;
    }

    static get app() {
        return this._app;
    }

    /**
     * 构建配置实例
     * @param configs 各个模块初始配置工厂集合：./configs目录下的所有配置 
     * @param option 动态存储选项
     */
    static async buildConfigure(configs: Record<string, any>, option?: ConfigStorageOption) {
        const configure = new Configure();
        // 初始化是否开启动态存储
        configure.init(option);
        // 添加各个模块的配置工厂
        for (const key in configs) {
            configure.add(key, configs[key])
        };
        // 执行各个模块的工厂添加到this.config中
        await configure.sync();
        return configure;
    }

    /**
     * 创建app实例
     * @param options 
     */
    static async create(options: CreateOptions) {
        const { builder, configs, configure } = options;
        let modules = {};
        try {
            // 初始化应用配置
            this._configure = await this.buildConfigure(configs, configure);
            // console.log("app的configure", this.configure);
            const { BootModule, modules: maps } = await createBootModule(
                { configure: this._configure },
                options,
            )
            modules = maps;
            // 根据BootModule，创建app实例
            this._app = await builder({
                configure: this.configure,
                BootModule
            })
            // 是否启用websockets
            if (await this.configure.get<boolean>("app.websockets")) {
                this._app.useWebSocketAdapter(new WsAdapter(this._app))
            }
            // 底层是fastify，启用文件上传
            if (this._app.getHttpAdapter() instanceof FastifyAdapter) {
                // 启用fastify文件上传
                this._app.register(require("@fastify/multipart"), {
                    attachFieldsToBody: true
                })
                const fastifyInstance = this._app.getHttpAdapter().getInstance();
                fastifyInstance.addHook(
                    'onRequest',
                    (request: any, reply: any, done: (...args: any[]) => any) => {
                        reply.setHeader = function (key: string, value: any) {
                            return this.raw.setHeader(key, value);
                        };
                        reply.end = function () {
                            this.raw.end();
                        };
                        request.res = reply;
                        done();
                    },
                );
            }
            // 启用app关闭的钩子
            this._app.enableShutdownHooks();
            // 添加到class validator的容器中，便于自定义数据库相关的约束
            useContainer(this._app.select(BootModule), {
                fallbackOnErrors: true
            })
            // 初始化应用
            if (this._app.getHttpAdapter() instanceof FastifyAdapter) {
                await this._app.init()
            }
        } catch (err) {
            console.error(err)
        };

        return { configure: this._configure, app: this._app, modules }
    }
}