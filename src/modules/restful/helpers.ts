import { Type } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Routes, RouteTree } from "@nestjs/core";
import { trim, omit, isNil, camelCase, upperFirst } from "lodash";
import { CreateModule } from "../core/helpers";
import { CONTROLLER_DEPENDS } from "./constants";
import { isFunction } from "lodash";
import { isAsyncFunction } from "util/types";
import { registerCrud } from "./register-crud";
import { RouteOption } from "./types";
import { Configure } from "../core/Configure";
import { CRUD_OPTIONS_REGISTER } from "./constants";

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
    const route: RouteOption = {
      ...omit(option, 'children'),
      path: trimPath(option.path)
    };
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
 * 便利路由树，创建路由模块
 * 类似于文档中的RouterModule.register
 * @param modules 
 * @param routes 
 * @param parentModule 
 */
export const createRouteModuleTree = (
  configure: Configure,
  modules: Record<string, Type<any>>,
  routes: RouteOption[],
  parentModule?: string
): Promise<Routes> => 
  Promise.all(
    routes.map(async ({ name, path, controllers, children, doc }) => {
      const moduleName = parentModule ? `${parentModule}.{name}` : name;
      // 路由模块名称必须唯一
      if (Object.keys(modules).includes(moduleName)) {
        throw new Error("路由名称重复 " + moduleName);
      }
      // 每个路由的依赖模块
      const depends = controllers
        .map((c) => Reflect.getMetadata(CONTROLLER_DEPENDS, c) ?? [])
        .reduce((o: Type<any>[], n) => {
          // 模块去重
          if (o.find(i => i === n)) return o;
          return [...o, n]
        });

      // 执行crud装饰器
      for (const controller of controllers) {
        const crudRegister = Reflect.getMetadata(CRUD_OPTIONS_REGISTER, controller);
        if (!isNil(crudRegister) && isFunction(crudRegister)) {
            const crudOptions = isAsyncFunction(crudRegister)
                ? await crudRegister(configure)
                : crudRegister(configure);
            registerCrud(controller, crudOptions);
        }
      }
      // 为没有ApiTags的controller添加Tag
      if (doc?.tags && doc.tags.length > 0) {
        controllers.forEach((controller) => {
          // 源码里定义metadata
          !Reflect.getMetadata('swagger/apiUseTags', controller) &&
            ApiTags(
                ...doc.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name))!,
            )(controller);
        })
      }
      // 创建路由模块，导入所有控制器的依赖模块（使用xxxService）
      const module = CreateModule(`${upperFirst(camelCase(name))}RouteModule`, () => ({
        controllers,
        imports: depends,
      }));
      modules[moduleName] = module;
      const route: RouteTree = { path, module };
      if (children) {
        route.children = await createRouteModuleTree(
          configure,
          modules,
          children,
          moduleName
        )
      };
      return route
    })
  )