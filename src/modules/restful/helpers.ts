import { Type } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Routes, RouteTree } from "@nestjs/core";
import { trim, omit, isNil, camelCase, upperFirst, isFunction } from "lodash";
import chalk from "chalk";

import { CreateModule } from "../core/helpers";
import { CONTROLLER_DEPENDS, CRUD_OPTIONS_REGISTER } from "./constants";
import { isAsyncFunction } from "@/modules/core/helpers";
import { registerCrud } from "./register-crud";
import { APIDocOption, RouteOption } from "./types";
import { Configure } from "../core/configure";
import { RestfulFactory } from "./factory";

/**
 * 清理路由前缀：
 * manage -> /manage
 * /manage -> /manage
 * //manage -> manage
 * @param routePath 
 * @param addPrefix 
 */
export const trimPath = (routePath: string, addPrefix = true) => 
    `${addPrefix ? '/' : ''}${trim(routePath.replace('//', '/'), '/')}`;

/**
 * 生成最终路由路径(为路由路径添加自定义及版本前缀)
 * app/v1/api/xxx
 * @param routePath
 * @param prefix
 * @param version
 */
export const genRoutePath = (routePath: string, prefix?: string, version?: string) =>
    trimPath(`${prefix}${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`);

/**
 * 生成最终文档路径
 * @param routePath
 * @param prefix
 * @param version
 */
export const genDocPath = (routePath: string, prefix?: string, version?: string) =>
    trimPath(`${prefix}${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`, false);

/**
 * 对路由树中每一项的path进行处理：/xxx
 * @param data 
 */
export const cleanRoutes = (data: RouteOption[]) => {
    return data.map((option) => {
        // 没有children就删了这个属性
        const route: RouteOption = {
            ...omit(option, 'children'),
            path: trimPath(option.path)
        };
        // 只有数组存在，且含有元素才放children属性
        if (!isNil(option.children) && option.children.length > 0) {
            route.children = cleanRoutes(option.children);
            return route;
        }
        // 没有children就删掉这个属性
        delete route.children;

        return route;
    })
}

/**
 * 对于所有的routes
 * 创建路由模块
 * 其中的controllers执行装饰器
 * 
 * @param configure 配置实例
 * @param modules 所有的路由模块
 * @param routes 路由表
 * @param parentModule 父模块名
 * @requires RouteTree，nestjs路由模块树
 */
export const createRouteModuleTree = (
    configure: Configure,
    modules: { [key: string]: Type<any> },
    routes: RouteOption[],
    parentModule?: string,
): Promise<Routes> =>
    Promise.all(
        routes.map(async ({ name, path, children, controllers, doc }) => {
            // 自动创建路由模块的名称：manage.content.xxx
            const moduleName = parentModule ? `${parentModule}.${name}` : name;
            // RouteModule的名称必须唯一
            if (Object.keys(modules).includes(moduleName)) {
                throw new Error('route name should be unique in same level!');
            }
            // 获取每个控制器的依赖模块
            const depends = controllers
                .map((c) => Reflect.getMetadata(CONTROLLER_DEPENDS, c) || [])
                .reduce((o: Type<any>[], n) => {
                    // 依赖模块去重
                    if (o.find((i) => i === n)) return o;
                    return [...o, ...n];
                }, []);
            
            //   for (const c of controllers) {
            //         console.log(Reflect.getMetadata(CONTROLLER_DEPENDS, c), c)
            //   }

            for (const controller of controllers) {
                // 拿到每个咯有模块的配置工厂函数 Crud里的函数
                const crudRegister = Reflect.getMetadata(CRUD_OPTIONS_REGISTER, controller);
                if (!isNil(crudRegister) && isFunction(crudRegister)) {
                    const crudOptions = isAsyncFunction(crudRegister)
                        ? await crudRegister(configure)
                        : crudRegister(configure);
                    // 执行路由装饰器 

                    await registerCrud(controller, crudOptions);
                    // if (controller.name === "UserController") {

                    //     console.log("hook", crudOptions.hook, controller, name)
                    // }
                }
            }
            // 为每个没有自己添加`ApiTags`装饰器的控制器添加Tag
            if (doc?.tags && doc.tags.length > 0) {
                controllers.forEach((controller) => {
                    // 这个key是 ApiTags源码里的
                    !Reflect.getMetadata('swagger/apiUseTags', controller) &&
                        ApiTags(
                            ...doc.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name))!,
                        )(controller);
                });
            }
            // 创建路由模块,并导入所有控制器的依赖模块
            const module = CreateModule(`${upperFirst(camelCase(name))}RouteModule`, () => ({
                controllers,
                imports: depends,
            }));
            // 在modules变量中追加创建的RouteModule,防止重名
            modules[moduleName] = module;
            const route: RouteTree = { path, module };
            // 如果有子路由则进一步处理
            if (children)
                route.children = await createRouteModuleTree(
                    configure,
                    modules,
                    children,
                    moduleName,
                );
            return route;
        }),
    );

/**
 * 输出各个版本的文档
 * @param configure 
 * @param factory 
 */
export async function echoApi(configure: Configure, factory: RestfulFactory) {
    // 文档路径？
    const appUrl = await configure.get<string>("app.url");
    // 服务路径
    const apiUrl = await configure.get<string>("app.api");
    console.log(`- RestAPI: ${chalk.green.underline(apiUrl)}`);
    console.log('- RestDocs:');
    const { default: defaultDoc, ...docs } = factory.docs;
    echoApiDocs("default", defaultDoc, appUrl);
    for (const [name, doc] of Object.entries(docs)) {
        console.log();
        echoApiDocs(name, doc, appUrl)
    }
}

function echoApiDocs(name: string, doc: APIDocOption, appUrl: string) {
    const getDocPath = (path: string) => `${appUrl}/${path}`;
    if (!doc.routes && doc.default) {
        console.log(
            `    [${chalk.blue(name.toUpperCase())}]: ${chalk.green.underline(
                getDocPath(doc.default.path),
            )}`,
        );
        return;
    }
    console.log(`    [${chalk.blue(name.toUpperCase())}]:`);
    if (doc.default) {
        console.log(`      default: ${chalk.green.underline(getDocPath(doc.default.path))}`);
    }
    if (doc.routes) {
        Object.entries(doc.routes).forEach(([_routeName, rdocs]) => {
            console.log(
                `      <${chalk.yellowBright.bold(rdocs.title)}>: ${chalk.green.underline(
                    getDocPath(rdocs.path),
                )}`,
            );
        });
    }
}