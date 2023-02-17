import { Injectable, INestApplication, Type } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { trim, omit } from "lodash";


import { RestfulConfigure } from "./configure";

import { ApiConfig, APIDocOption, SwaggerOption, VersionOption, RouteOption, ApiDocSource } from "../types";
import { genDocPath } from "../helpers";

@Injectable()
export class RestfulFactory extends RestfulConfigure {
  /**
   * 文档列表
   */
  protected _docs!: {
    [version: string]: APIDocOption;
  }

  /**
   * 排除已经添加的模块
   */
  protected excludeVersionModules: string[] = [];

  get docs() {
    return this._docs;
  }

  async create(config: ApiConfig) {
    this.createConfig(config);
    await this.createRoutes();
    this.createDocs();
  }

  /**
   * 整合swagger
   * @param app 
   */
  factoryDocs<T extends INestApplication>(app: T) {
    const docs = Object.values(this.docs)
      .map((vdoc) => [vdoc.default, ...Object.values(vdoc.routes ?? {})])
      .reduce((o, n) => [...o, ...n], [])
      .filter((i) => !!i);
    
    for (const option of docs) {
      const { title, description, version, auth, include, tags } = option;
      const builder = new DocumentBuilder();
      if (title) builder.setTitle(title);
      if (description) builder.setDescription(description);
      if (auth) builder.addBearerAuth();
      if (tags) {
        tags.forEach((tag) => {
          if (typeof tag === "string") builder.addTag(tag);
          else builder.addTag(tag.name, tag.description, tag.externalDocs)
        })
      }
      builder.setVersion(version);
      const document = SwaggerModule.createDocument(app, builder.build(), {
        include: include.length > 0 ? include : [() => undefined as any]
      });
      SwaggerModule.setup(option.path, app, document)
    }
  }

  getModuleImports() {
    return [...Object.values(this.modules), RouterModule.register(this.routes)];
  }

  /**
   * 创建每个版本的文档
   */
  protected createDocs() {
    const versionMaps = Object.entries(this.config.versions);
    const vDocs = versionMaps.map(([name, version]) => {
      // name是版本号
      return [name, this.getDocOption(name, version)]
    });
    this._docs = Object.fromEntries(vDocs);
    const defaultVersion = this.config.versions[this._default];
    // 为默认版本再次生成一个文档
    this._docs.default = this.getDocOption(this._default, defaultVersion, true);
  }

  /**
   * 创建一个版本的文档
   * @param name 版本名
   * @param option 
   * @param isDefault 
   */
  protected getDocOption(name: string, option: VersionOption, isDefault = false) {
    const docConfig: APIDocOption = {};
    // version上配置的文档
    const defaultDoc = {
      title: option.title,
      description: option.description,
      auth: option.auth ?? false,
      tags: option.tags ?? [],
      version: name,
      path: trim(`${this.config.prefix?.doc}${isDefault ? "" : `/${name}`}`, "/"),
    };
    // 获取应用的路由文档
    const routesDoc = isDefault
      ? this.getRouteDocs(defaultDoc, option.routes ?? [], undefined)
      : this.getRouteDocs(defaultDoc, option.routes ?? [], name);

    // 存在路由文档
    if (Object.keys(routesDoc).length > 0) {
      docConfig.routes = routesDoc;
    }
    const routeModules = isDefault 
      ? this.getRouteModules(option.routes ?? [])
      : this.getRouteModules(option.routes ?? [], name);
    // 文档所依赖的模块
    const include = this.filterExcludeModules(routeModules);
    // 版本DOC中有依赖的路由模块或者版本DOC中没有路由DOC则添加版本默认DOC
    if (include.length > 0 || !docConfig.routes) {
        docConfig.default = { ...defaultDoc, include };
    }
    
    return docConfig;
  }

  protected filterExcludeModules(routeModules: Type<any>[]) {
    const excludeModules: Type<any>[] = [];
    const excludeNames = Array.from(new Set(this.excludeVersionModules));
    for (const [name, module] of Object.entries(this.modules)) {
      if (excludeNames.includes(name)) excludeModules.push(module)
    };
    return routeModules.filter(
      (module) => !excludeModules.find((m) => m === module)
    )
  }

  /**
   * 获取路由的路由文档
   * @param option app所属version的配置
   */
  protected getRouteDocs(
    option: Omit<SwaggerOption, 'include'>,
    routes: RouteOption[],
    parent?: string
  ) {
    /**
     * 合并版本文档与路由文档
     * @param doc 
     * @param route 
     */
    const mergeDoc = (doc: Omit<SwaggerOption, 'include'>, route: RouteOption) => ({
      ...doc,
      ...route.doc,
      tags: Array.from(new Set([...(doc.tags ?? []), ...(route?.doc?.tags ?? [])])),
      path: genDocPath(route.path, this.config?.prefix?.doc, parent),
      // 文档包含的路由模块
      include: this.getRouteModules([route], parent)
    })
    let routesDocs: Record<string, SwaggerOption> = {};

    // 判断路由是否有除tags之外的其它doc属性
    const hasAdditional = (doc?: ApiDocSource) =>
      doc && Object.keys(omit(doc, 'tags')).length > 0;

    for (const route of routes) {
      const { name, doc, children } = route;
      const moduleName = parent ? `${parent}.${name}` : name;

      // 假如在版本DOC中排除模块列表
      if (hasAdditional(doc) || parent) this.excludeVersionModules.push(moduleName);

      if (hasAdditional(doc)) {
        routesDocs[moduleName.replace(`${option.version}.`, '')] = mergeDoc(option, route);
      }
      if (children) {
        routesDocs = {
          ...routesDocs,
          ...this.getRouteDocs(option, children, moduleName)
        }
      };
    }
    return routesDocs;
  }
}