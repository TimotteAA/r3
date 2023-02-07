import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DYNAMIC_RELATIONS } from "./constants"
import { isNil } from "lodash"
import { DynamicRelation } from "./types"


/**
 * 在模块上注册entity
 * @param entities 
 * @param dataSource 数据库连接名称
 */
export const addEntities = (entities: EntityClassOrSchema[] = [], dataSource = "default") => {
  const es = entities.map(entity => {
    // 装饰器的动态关联
    const registerRelation = Reflect.getMetadata(DYNAMIC_RELATIONS, entity);
    // 判断传入的entity是不是类
    if ('prototype' in entity && !isNil(registerRelation) && typeof registerRelation === "function") {
      // 取出relations
      const relations: DynamicRelation[] = registerRelation();
      relations.forEach(({ column, relation, others }) => {
        // 先加上字段
        const property = Object.getOwnPropertyDescriptor(entity.prototype, column);
        if (isNil(property)) {
          // 加上这个属性
          Object.defineProperty(entity.prototype, column, {
            writable: true
          });
          // 执行关联关系的属性装饰器
          relation(entity.prototype, column);
          // 其余的装饰器
          if (!isNil(others)) {
            for (const other of others) {
              other(entity.prototype, column)
            }
          }
        }
      })
    }
    return entity;
  })
  return TypeOrmModule.forFeature(es, dataSource);
}