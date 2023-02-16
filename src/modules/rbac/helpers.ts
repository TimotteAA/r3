import { MongoAbility } from "@casl/ability";
import { FastifyRequest as Request } from "fastify";
import { isNil } from "lodash";
import { ObjectLiteral } from "typeorm";
import { ApiOperation, ApiOperationOptions } from "@nestjs/swagger";
import { CrudMethodOption } from "@/modules/restful/types";
import { PermissionAction } from "./constants";
import { ManualPermission } from "./decorators";
import { PermissionChecker } from "./types";

/**
 * 从request中的params或body中得到id或ids字段
 * @param request 
 */
export const getRequestItems = (request?: Request): string[] => {
  const { params = {}, body = {} } = (request ?? {}) as any;
  const id = params.id ?? body.id ?? params.item ?? body.item ?? body.receives;
  const { ids } = body;
  if (!isNil(id)) return [id];
  return !isNil(ids) && Array.isArray(ids) ? ids : []
}

/**
 * 验证是否是数据所有者
 * @param ability 
 * @param getModels 获取entity的方法
 * @param request 
 * @param permission 权限的action
 */
export const checkOwner = async <E extends ObjectLiteral> (
  ability: MongoAbility,
  getModels: (ids: string[]) => Promise<E[]>,
  request?: Request,
  permission?: string,
) => {  

  const models = await getModels(getRequestItems(request));
  // console.log("models", models);
  // console.log("permission", permission);
  if (!models || !models.length) return false;
  // console.log(models.every((model) => ability.can(permission ?? PermissionAction.OWNER, model)))
  return models.every((model) => ability.can(permission ?? PermissionAction.OWNER, model));
}

/**
 * 给crud装饰器添加权限
 * @param permissions 
 */
export const simpleCrudOptions = (
  permissions?: PermissionChecker[],
  options?: ApiOperationOptions
): CrudMethodOption => {
  return {
    hook: (target, method) => {
      // 手动执行装饰器与装饰器工厂
      if (permissions) ManualPermission(target, method, permissions);
      if (options) {
        // console.log("options", options);
        // console.log(target, method, Object.getOwnPropertyDescriptor(target.prototype, method));
        // ApiOperation(options)(target, method, Object.getOwnPropertyDescriptor(target.prototype, method))
        ApiOperation(options)
      }
    },
  };
}