import { Module, ModuleMetadata, Type } from "@nestjs/common";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { isNil } from "lodash";
import { OrderQueryType } from "./types";

export function getQrderByQuery<E extends ObjectLiteral>(
  qb: SelectQueryBuilder<E>,
  alias: string,
  orderBy?: OrderQueryType,
): SelectQueryBuilder<E> {
  if (isNil(orderBy)) return qb;
  if (typeof orderBy === 'string') {
      return qb.orderBy(`${alias}.${orderBy}`, 'DESC');
  }
  if (Array.isArray(orderBy)) {
      let i = 0;

      for (const item of orderBy) {
          // 第一个orderBy
          if (i === 0) {
              qb =
                  typeof item === 'string'
                      ? qb.orderBy(`${alias}.${item}`, 'DESC')
                      : qb.orderBy(`${alias}.${item.name}`, `${item.order}`);
              i++;
          } else {
              qb =
                  typeof item === 'string'
                      ? qb.addOrderBy(`${alias}.${item}`, 'DESC')
                      : qb.addOrderBy(`${alias}.${item.name}`, `${item.order}`);
          }
      }
      return qb;
  }
  return qb.orderBy(`${alias}.${orderBy.name}`, `${orderBy.order}`);
}

/**
 * 动态创建模块
 * @param target 
 * @param moduleMetadataSetter 
 */
export const CreateModule = (
    target: string | Type<any>,
    moduleMetadataSetter: () => ModuleMetadata = () => ({})
) => {
    let ModuleClass: Type<any>;
    if (typeof target === "string") {
        // 传入类的名称，创建匿名类，并赋予name属性
        ModuleClass = class {}
        // ModuleClass.name = target
        Object.defineProperty(ModuleClass, "name", {
            value: target
        });
    } else {
        // 直接传入类
        ModuleClass = target;
    }
    // 执行模块装饰器
    Module(moduleMetadataSetter())(ModuleClass);
    return ModuleClass;
}