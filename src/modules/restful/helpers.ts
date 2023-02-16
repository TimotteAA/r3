import { Type } from "@nestjs/common";
import { Routes, RouteTree } from "@nestjs/core";
import { trim, omit, isNil, camelCase, upperFirst } from "lodash";
import { CreateModule } from "../core/helpers";
import { CONTROLLER_DEPENDS } from "./constants";

import { RouteOption } from "./types";

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
 * @param modules 
 * @param routes 
 * @param parentModule 
 */
export const createRouteModuleTree = (
  modules: Record<string, Type<any>>,
  routes: RouteOption[],
  parentModule?: string
): Routes => 
  routes.map((option) => {
    const { name, path, controllers } = option;
    // 后续处理的子项
    let items: RouteOption[];
    if ("children" in option) items = option.children;
    // 创建的模块名
    const moduleName = parentModule ? `${parentModule}.${name}` : name;
    // 创建的模块名称必须唯一
    if (Object.keys(modules).includes(moduleName)) {
      throw new Error(`路由模块名称${moduleName}在同层中不唯一`);
    }
    const depends = controllers
      .map((c) => Reflect.getMetadata(CONTROLLER_DEPENDS, c) || [])
      .reduce((o: Type<any>[], n) => {
        // 模块去重
        if (o.find((i) => i === n)) return o;
        return [...o, ...n]
      }, []);
    // 创建路由模块，并导入所有的依赖模块
    // AppContentRouteModule
    const module = CreateModule(`${upperFirst(camelCase(moduleName))}RouteModule`, () => ({
      controllers,
      imports: depends,
    }))
    // 记录刚创建的模块，并防止重名
    modules[moduleName] = module;
    const route: RouteTree = { path, module };

    // 递归处理子路由
    if (items) route.children = createRouteModuleTree(modules, items, moduleName);
    return route;
  })
