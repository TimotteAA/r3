import { MongoAbility } from "@casl/ability";
import { FastifyRequest as Request } from "fastify";
import { isNil } from "lodash";
import { ObjectLiteral } from "typeorm";
import { CrudMethodOption } from "../core/types";
import { PermissionAction } from "./constants";
import { ManualPermission } from "./decorators";
import { PermissionChecker } from "./types";

/**
 * 从request中的params或body中得到id或ids字段
 * @param request 
 */
export const getRequestItems = (request?: Request): string[] => {
  const { params = {}, body = {} } = (request ?? {}) as any;
  const id = params.id ?? body.id ?? params.item ?? body.item;
  const { ids } = body;
  if (!isNil(id)) return [id];
  return !isNil(ids) && Array.isArray(ids) ? ids : []
}

/**
 * 验证是否是数据所有者
 * @param ability 
 * @param getModels 
 * @param request 
 * @param permission 
 */
export const checkOwner = async <E extends ObjectLiteral> (
  ability: MongoAbility,
  getModels: (ids: string[]) => Promise<E[]>,
  request?: Request,
  permission?: string,
) => {  
  const models = await getModels(getRequestItems(request));
  return models.every((model) => ability.can(permission ?? PermissionAction.OWNER, model));
}

export const simpleCrudOptions = (
  permissions?: PermissionChecker[],
): CrudMethodOption => {
  console.log("执行了吗", permissions)
  

  return {
    hook: (target, method) => {
      if (permissions) ManualPermission(target, method, permissions);
    },
  };
}