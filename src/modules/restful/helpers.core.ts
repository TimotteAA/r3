// import { Type } from "@nestjs/common";
// import { ApiTags } from "@nestjs/swagger";
// import { Routes, RouteTree } from "@nestjs/core";
// import { trim, omit, isNil, camelCase, upperFirst } from "lodash";
// import { CreateModule } from "../core/helpers";
// import { CONTROLLER_DEPENDS } from "./constants";
// import { isFunction } from "lodash";
// import { isAsyncFunction } from "util/types";
// import { registerCrud } from "./register-crud";
// import { RouteOption } from "./types";
// import { CRUD_OPTIONS_REGISTER } from "./constants";

// /**
//  * 清理路由前缀：
//  * manage -> /manage
//  * /manage -> /manage
//  * //manage -> manage
//  * @param routePath 
//  * @param addPrefix 
//  */
// export const trimPath = (routePath: string, addPrefix = true) => 
//   `${addPrefix ? '/' : ''}${trim(routePath.replace('//', '/'), '/')}`;

// /**
//  * 生成最终路由路径(为路由路径添加自定义及版本前缀)
//  * app/v1/api/xxx
//  * @param routePath
//  * @param prefix
//  * @param version
//  */
// export const genRoutePath = (routePath: string, prefix?: string, version?: string) =>
//   trimPath(`${prefix}${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`);

// /**
//  * 生成最终文档路径
//  * @param routePath
//  * @param prefix
//  * @param version
//  */
// export const genDocPath = (routePath: string, prefix?: string, version?: string) =>
//   trimPath(`${prefix}${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`, false);

// /**
//  * 对路由树中每一项的path进行处理：/xxx
//  * @param data 
//  */
// export const cleanRoutes = (data: RouteOption[]) => {
//   return data.map((option) => {
//     const route: RouteOption = {
//       ...omit(option, 'children'),
//       path: trimPath(option.path)
//     };
//     if (!isNil(option.children) && option.children.length > 0) {
//       route.children = cleanRoutes(option.children);
//       return route;
//     }
//     // 没有children就删掉这个属性
//     delete route.children;

//     return route;
//   })
// }

// export const createRouteModuleTree = (
//   configure: {},
//   modules: { [key: string]: Type<any> },
//   routes: RouteOption[],
//   parentModule?: string,
// ): Promise<Routes> =>
//   Promise.all(
//       routes.map(async ({ name, path, children, controllers, doc }) => {
//           // 自动创建路由模块的名称
//           const moduleName = parentModule ? `${parentModule}.${name}` : name;
//           // RouteModule的名称必须唯一
//           if (Object.keys(modules).includes(moduleName)) {
//               throw new Error('route name should be unique in same level!');
//           }
//           // 获取每个控制器的依赖模块
//           const depends = controllers
//               .map((c) => Reflect.getMetadata(CONTROLLER_DEPENDS, c) || [])
//               .reduce((o: Type<any>[], n) => {
//                   if (o.find((i) => i === n)) return o;
//                   return [...o, ...n];
//               }, []);
          
//           for (const c of controllers) {
//             console.log(Reflect.getMetadata(CONTROLLER_DEPENDS, c), c)
//           }

//           for (const controller of controllers) {
//               const crudRegister = Reflect.getMetadata(CRUD_OPTIONS_REGISTER, controller);
//               if (!isNil(crudRegister) && isFunction(crudRegister)) {
//                   const crudOptions = isAsyncFunction(crudRegister)
//                       ? await crudRegister(configure)
//                       : crudRegister(configure);
//                   registerCrud(controller, crudOptions);
//               }
//           }
//           // 为每个没有自己添加`ApiTags`装饰器的控制器添加Tag
//           if (doc?.tags && doc.tags.length > 0) {
//               controllers.forEach((controller) => {
//                   !Reflect.getMetadata('swagger/apiUseTags', controller) &&
//                       ApiTags(
//                           ...doc.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name))!,
//                       )(controller);
//               });
//           }
//           // 创建路由模块,并导入所有控制器的依赖模块
//           const module = CreateModule(`${upperFirst(camelCase(name))}RouteModule`, () => ({
//               controllers,
//               imports: depends,
//           }));
//           // 在modules变量中追加创建的RouteModule,防止重名
//           modules[moduleName] = module;
//           const route: RouteTree = { path, module };
//           // 如果有子路由则进一步处理
//           if (children)
//               route.children = await createRouteModuleTree(
//                   configure,
//                   modules,
//                   children,
//                   moduleName,
//               );
//           return route;
//       }),
//   );
export {}