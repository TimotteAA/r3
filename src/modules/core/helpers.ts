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