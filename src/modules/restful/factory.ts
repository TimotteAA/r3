import { Injectable, INestApplication, Type } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { trim, omit } from 'lodash';

import { RestfulConfigure } from './configure';
import { genDocPath } from './helpers';
import { ApiConfig, APIDocOption, RouteOption, SwaggerOption, VersionOption, ApiDocSource } from './types';

@Injectable()
export class RestfulFactory extends RestfulConfigure {
    /**
     * 文档列表
     */
    protected _docs!: {
        [version: string]: APIDocOption;
    };

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
        const docs = Object.values(this._docs)
            // 默认的，以及各个版本的路由文档
            .map((vdoc) => [vdoc.default, ...Object.values(vdoc.routes ?? {})])
            .reduce((o, n) => [...o, ...n], [])
            .filter((i) => !!i);

        // 添加各个版本的文档
        for (const voption of docs) {
            const { title, description, version, auth, include, tags } = voption!;
            const builder = new DocumentBuilder();
            if (title) builder.setTitle(title);
            if (description) builder.setDescription(description);
            if (auth) builder.addBearerAuth();
            if (tags) {
                tags.forEach((tag) =>
                    typeof tag === 'string'
                        ? builder.addTag(tag)
                        : builder.addTag(tag.name, tag.description, tag.externalDocs),
                );
            }
            builder.setVersion(version);
            // console.log(version, include);
            const document = SwaggerModule.createDocument(app, builder.build(), {
                include: include.length > 0 ? include : [() => undefined as any],
            });
            SwaggerModule.setup(voption!.path, app, document);
        }
    }

    /**
     * 路由模块与注册路由
     */
    getModuleImports() {
        return [...Object.values(this.modules), RouterModule.register(this.routes)];
    }

    /**
     * 创建文档
     */
    protected createDocs() {
        /**
         * 各个版本的配置
         */
        const versionMaps = Object.entries(this.config.versions);
        /**
         * 为各个版本创建文档
         */
        const vDocs = versionMaps.map(([name, version]) => [
            name,
            this.getDocOption(name, version),
        ]);
        this._docs = Object.fromEntries(vDocs);
        // 为默认版本创建文档
        const defaultVersion = this.config.versions[this._default];
        // 为默认版本再次生成一个文档
        this._docs.default = this.getDocOption(this._default, defaultVersion, true);
    }

    /**
     * 创建某一版本的文档
     * @param name
     * @param voption
     * @para isDefault
     */
    protected getDocOption(name: string, voption: VersionOption, isDefault = false) {
        // 总体的文档
        const docConfig: APIDocOption = {};
        // 默认文档配置（版本设置的文档，最顶层的文档）
        const defaultDoc = {
            title: voption.title!,
            description: voption.description!,
            tags: voption.tags ?? [],
            auth: voption.auth ?? false,
            version: name,
            // 文档路径
            path: trim(`${this.config.prefix?.doc}${isDefault ? '' : `/${name}`}`, '/'),
        };
        // 获取路由的文档（更深层次的文档配置）
        // 默认路由不需要版本号
        const routesDoc = isDefault
            ? this.getRouteDocs(defaultDoc, voption.routes ?? [])
            : this.getRouteDocs(defaultDoc, voption.routes ?? [], name);
        if (Object.keys(routesDoc).length > 0) {
            docConfig.routes = routesDoc;
        }
        const routeModules = isDefault 
            ? this.getRouteModules(voption.routes ?? [])
            : this.getRouteModules(voption.routes ?? [], name);
        // 文档所依赖的模块
        const include = this.filterExcludeModules(routeModules);
        // 版本DOC中有依赖的路由模块或者版本DOC中没有路由DOC则添加版本默认DOC
        if (include.length > 0 || !docConfig.routes) {
            docConfig.default = { ...defaultDoc, include };
        }
        return docConfig;
    }

    /**
     * 排除已经添加的模块
     * @param routeModules
     */
    protected filterExcludeModules(routeModules: Type<any>[]) {
        const excludeModules: Type<any>[] = [];
        const excludeNames = Array.from(new Set(this.excludeVersionModules));
        for (const [name, module] of Object.entries(this._modules)) {
            if (excludeNames.includes(name)) excludeModules.push(module);
        }
        return routeModules.filter(
            (rmodule) => !excludeModules.find((emodule) => emodule === rmodule),
        );
    }

    /**
     * 生成路由文档
     * @param option 版本文档配置
     * @param routes 路由书
     * @param parent 版本名
     */
    protected getRouteDocs(
        option: Omit<SwaggerOption, 'include'>,
        routes: RouteOption[],
        parent?: string,
    ): Record<string, SwaggerOption> {
        /**
         * 合并父级的Doc配置
         *
         * @param {Omit<SwaggerOption, 'include'>} vDoc 版本文档配置
         * @param {RouteOption} route
         */
        const mergeDoc = (vDoc: Omit<SwaggerOption, 'include'>, route: RouteOption) => ({
            ...vDoc,
            ...route.doc,
            tags: Array.from(new Set([...(vDoc.tags ?? []), ...(route.doc?.tags ?? [])])),
            path: genDocPath(route.path, this.config.prefix?.doc, parent),
            // 路由所需的模块
            include: this.getRouteModules([route], parent),
        });
        let routeDocs: { [key: string]: SwaggerOption } = {};

        // 判断路由是否有除tags之外的其它doc属性
        const hasAdditional = (doc?: ApiDocSource) =>
            doc && Object.keys(omit(doc, 'tags')).length > 0;

        for (const route of routes) {
            const { name, doc, children } = route;
            const moduleName = parent ? `${parent}.${name}` : name;

            // 加入在版本DOC中排除模块列表
            if (hasAdditional(doc) || parent) this.excludeVersionModules.push(moduleName);

            // 添加到routeDocs中
            if (hasAdditional(doc)) {
                routeDocs[moduleName.replace(`${option.version}.`, '')] = mergeDoc(option, route);
            }
            if (children) {
                routeDocs = {
                    ...routeDocs,
                    ...this.getRouteDocs(option, children, moduleName),
                };
            }
        }
        return routeDocs;
    }
}
