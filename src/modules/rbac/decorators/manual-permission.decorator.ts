import { Type } from "@nestjs/common";

import { PermissionChecker } from "../types";
import { PERMISSION_CHECKERS } from "../constants";

/**
 * 在路由方法上添加权限校验器
 */
export const ManualPermission = (
  target: Type<any>,
  method: string, 
  checkers: PermissionChecker[]
) => {
  console.log(target, method, checkers)
  Reflect.defineMetadata(PERMISSION_CHECKERS, checkers, target.prototype, method)
}