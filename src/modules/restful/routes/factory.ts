import { Injectable, INestApplication } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { trim } from "lodash";

import { deepMerge } from "@/modules/utils";

import { RestfulConfigure } from "./configure";

import { ApiConfig, APIDocOption, SwaggerOption, VersionOption, AppOption} from "../types";
import { genDocPath } from "../helpers";

@Injectable()
export class RestfulFactory extends RestfulConfigure {
  /**
   * 文档列表
   */
  protected _docs!: {
    [version: string]: APIDocOption;
  }

  get docs() {
    return this._docs;
  }

  create(config: ApiConfig) {
    this.createConfig(config);
    this.createRoutes();
    this.createDocs();
  }

  factoryDocs<T extends INestApplication>(app: T) {
    const docs = Object.values(this.docs)
      .map((vdoc) => [vdoc.default, ...Object.values(vdoc.apps ?? {})])
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

  protected createDocs() {
    const versionMaps = Object.entries(this.config.versions);
    const vDocs = versionMaps.map(([name, version]) => {
      return [name, this.getVersionDoc(name, version)]
    });
    this._docs = Object.fromEntries(vDocs);
    const defaultVersion = this.config.versions[this._default];
    // 为默认版本再次生成一个文档
    this._docs.default = this.getVersionDoc(this._default, defaultVersion, true);
  }

  /**
   * 创建一个版本的文档
   * @param name 版本名
   * @param option 
   * @param isDefault 
   */
  protected getVersionDoc(name: string, option: VersionOption, isDefault = false) {
    const docConfig: APIDocOption = {};
    // 每个版本的默认文档
    const defaultDoc = {
      title: option.title,
      description: option.description,
      auth: option.auth ?? false,
      tags: option.tags ?? [],
      version: name,
      path: trim(`${this.config.prefix?.doc}${isDefault ? "" : `/${name}`}`, "/"),
    };
    // 获取应用的路由文档
    const versionDoc = isDefault
      ? this.getAppDoc(defaultDoc, option.apps ?? [], undefined)
      : this.getAppDoc(defaultDoc, option.apps ?? [], name);

    if (Object.keys(versionDoc).length > 0) {
      docConfig.apps = versionDoc;
    }
    if (!docConfig.apps) {
      docConfig.default = { ...defaultDoc, include: [] };
    }
    return docConfig;
  }

  /**
   * 获取APP的open API配置
   * @param option app所属version的配置
   */
  protected getAppDoc(
    option: Omit<SwaggerOption, 'include'>,
    apps: AppOption[],
    parent?: string
  ) {
    const docs: Record<string, SwaggerOption> = {};
    for (const app of apps) {
      docs[app.name] = {
        ...deepMerge(option, app.doc, 'merge'),
        tags: Array.from(new Set([...(option.tags ?? []), ...(app.doc?.tags ?? [])])),
        path: genDocPath(app.path, this.config.prefix?.doc, parent),
        // 文档对应的路由模块
        include: this.getRouteModules([{ ...app, children: app.children ?? [] }], parent)
      }
    }
    return docs;
  }
}