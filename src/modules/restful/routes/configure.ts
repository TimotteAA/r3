import { Type } from "@nestjs/common";
import { Routes } from "@nestjs/core";
import { get, pick } from "lodash";

import { createRouteModuleTree, genRoutePath, cleanRoutes } from "../helpers";

import { ApiConfig, RouteOption } from "../types";

export abstract class RestfulConfigure {
  /**
   * API配置
   */
  protected config!: ApiConfig;

  /**
   * 最终创建出的路由表
   */
  protected _routes: Routes = [];

  /**
   * 默认的api版本号
   */
  protected _default!: string;

  /**
   * 所有启用的API版本
   */
  protected _versions: string[] = [];

  /**
   * 创建出的所有路由模块
   */
  protected _modules: Record<string, Type<any>> = {};

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

  getConfig<T>(key?: string, defaultValue?: any): T{
    return key ? get(this.config, key, defaultValue) : this.config;
  }

  abstract create(_config: ApiConfig): void;

  /**
   * 对传入的ApiConfig做整理：
   * 每个app有自己的title、description、auth
   * 每个版本也有
   * 总体的rest模块配置也有
   * 会被从上到下逐一覆盖
   * 
   * 同时清理路由path
   */
  protected createConfig(config: ApiConfig) {
    if (!config.default) {
      throw new Error("请至少选择一个版本的api作为默认api版本");
    }
    const versionMaps = Object.entries(config.versions)
      // 过滤启用的版本
      .filter(([name]) => {
        if (config.default === name) return true;
        return config.enabled.includes(name);
      })
      // 合并版本配置到总配置中
      .map(([name, version]) => [
        name,
        {
          ...pick(config, ['title', 'auth', 'description']),
          ...version,
          tags: Array.from(new Set([...(config.tags ?? []), ...(version.tags ?? [])])),
          apps: cleanRoutes(version.apps ?? [])
        },
      ]);
    config.versions = Object.fromEntries(versionMaps);
    // 根据配置设置所有的版本号与默认的版本号
    this._versions = Object.keys(config.versions);
    // 设置默认版本号
    this._default = config.default;
    // 启用的版本中必须包含默认版本
    if (!this.versions.includes(this.default)) {
      throw new Error(`Default api version named ${this._default} not exists!`)
    };
    this.config = config;
  };

  /**
   * 根据路由表，获得对应的所有创建出的动态模块
   * @param routes 路由表
   * @param parent 上级路由
   */
  protected getRouteModules(routes: RouteOption[], parent?: string) {
    const result = routes
      .map(({name, children}) => {
        const routeName = parent ? `${parent}.${name}` : name;;
        let modules: Type<any>[] = [this.modules[routeName]];
        if (children) modules = [...modules, ...this.getRouteModules(children, routeName)];
        return modules;
      })
      .reduce((o, n) => [...o, ...n], [])
      .filter((i) => !!i);

    return result;
  }

  /**
   * 创建路由树及模块，所有的路由模块展评放到了this.modules中
   */
  protected createRoutes() {
    // 所有版本的version创建对应的路由
    const versionMaps = Object.entries(this.config.versions);
    
    // 针对每个版本的路由，为每个app创建路由
    this._routes = versionMaps
      .map(([name, version]) => 
        createRouteModuleTree(this._modules, version.apps ?? [], name).map((app) => ({
          ...app,
          path: genRoutePath(app.path, this.config.prefix?.route, name)
        }))
      )
      .reduce((o, n) => [...o, ...n], []);

    // 生成默认省略版本号的路由
    const defaultVersion = this.config.versions[this.default];
    this._routes = [
      ...this._routes,
      ...createRouteModuleTree(this._modules, defaultVersion.apps ?? []).map((app) => ({
        ...app,
        path: genRoutePath(app.path, this.config.prefix?.route)
      }))
    ]
  }
}