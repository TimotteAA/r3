import { Type } from '@nestjs/common';
import { Routes } from '@nestjs/core';
import { get, pick } from 'lodash';
import { Configure } from '../core/configure';

import { createRouteModuleTree, genRoutePath, cleanRoutes } from './helpers';

import { ApiConfig, RouteOption } from './types';
/**
 * Rest模块配置
 */
export abstract class RestfulConfigure {
    constructor(protected configure: Configure) {}
    
    /**
     * Rest模块配置（API配置）
     */
    protected config!: ApiConfig;

    /**
     * 路由表
     */
    protected _routes: Routes = [];

    /**
     * 默认API版本号
     */
    protected _default!: string;

    /**
     * 启用的API版本
     */
    protected _versions: string[] = [];

    /**
     * 根据controller自动创建的RouteModule
     */
    protected _modules: { [key: string]: Type<any> } = {};

    get routes() {
        return this._routes;
    }

    get default() {
        return this._default;
    }

    get versions() {
        return this._versions;
    }

    get modules() {
        return this._modules;
    }

    getConfig<T>(key?: string, defaultValue?: any): T {
        return key ? get(this.config, key, defaultValue) : this.config;
    }

    abstract create(_config: ApiConfig): void;

    /**
     * 创建配置
     * @param config
     */
    protected createConfig(config: ApiConfig) {
        if (!config.default) {
            throw new Error('default api version name should been config!');
        }
        // 整理各个version的配置
        const versionMaps = Object.entries(config.versions)
            // 过滤启用的版本
            .filter(([name]) => {
                if (config.default === name) return true;
                return config.enabled.includes(name);
            })
            // 合并version与总配置（模块配置）中的title、description、auth
            // 清楚path
            .map(([name, version]) => [
                name,
                {
                    ...pick(config, ['title', 'description', 'auth']),
                    ...version,
                    tags: Array.from(new Set([...(config.tags ?? []), ...(version.tags ?? [])])),
                    routes: cleanRoutes(version.routes ?? []),
                },
            ]);
        // 清理后的version配置
        config.versions = Object.fromEntries(versionMaps);
        // 设置所有版本号
        this._versions = Object.keys(config.versions);
        // 设置默认版本号
        this._default = config.default;
        // 启用的版本中必须包含默认版本
        if (!this._versions.includes(this._default)) {
            throw new Error(`Default api version named ${this._default} not exists!`);
        }
        this.config = config;
    }

    /**
     * 获取一个路由列表下的所有路由模块(路由模块是手动创建的动态模块)
     * @param routes
     * @param parent
     */
    protected getRouteModules(routes: RouteOption[], parent?: string) {
        const result = routes
            .map(({ name, children }) => {
                // createRouteModuleTree一致
                const routeName = parent ? `${parent}.${name}` : name;
                let modules: Type<any>[] = [this._modules[routeName]];
                if (children) modules = [...modules, ...this.getRouteModules(children, routeName)];
                return modules;
            })
            .reduce((o, n) => [...o, ...n], [])
            // 有些可能不存在，过去存在的
            .filter((i) => !!i);
        return result;
    }

    /**
     * 创建各个版本的路由树及路由模块
     */
    protected async createRoutes() {
        const versionMaps = Object.entries(this.config.versions);

        // 对每个版本的路由使用'createRouteModuleTree'方法进行处理
        this._routes = (
            await Promise.all(
                // name为版本
                versionMaps.map(async ([name, version]) =>
                    // 先创建路由模块
                    (
                        await createRouteModuleTree(
                            this.configure,
                            this._modules,
                            version.routes ?? [],
                            name
                        )
                    ).map((route) => ({
                        ...route,
                        // 添加路由前缀，生成最后的路径
                        // name是对应的版本
                        path: genRoutePath(route.path, this.config.prefix?.route, name)
                    }))
                )
            )
        ).reduce((o, n) => [...o, ...n], []);

        // 生成一个默认省略版本号的路由： /api/xxx
        const defaultVersion = this.config.versions[this._default];
        this._routes = [
            ...this._routes,
            ...(
                await createRouteModuleTree(
                    this.configure,
                    this._modules,
                    defaultVersion.routes,
                )
            ).map((route) => ({
                ...route,
                path: genRoutePath(route.path, this.config.prefix?.route)
            }))
        ];

    }
}
