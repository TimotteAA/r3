import { ObjectLiteral, SelectQueryBuilder, DataSource, Repository, ObjectType } from "typeorm";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Type } from "@nestjs/common";
import { isNil } from "lodash"

import { CUSTOM_REPOSITORY_METADATA } from "./constants";
import { Configure } from "../core/configure";
import { DYNAMIC_RELATIONS } from "./constants"
import { DbConfig, DbConfigOptions, DynamicRelation, OrderQueryType } from "./types"
import { deepMerge } from "../utils";
import path from "path";
import { createConnectionOptions } from "../core/helpers";
// import { EnvironmentType } from "../core/constants";
import { ConfigureRegister, ConfigureFactory } from "../core/types";


/**
 * 加工数据库配置
 * @param configure 
 * @param options 
 */
export const createDbOptions = (configure: Configure, options: DbConfigOptions) => {
    // console.log("options", options);
    const newOptions: DbConfigOptions = {
        common: deepMerge({
          charset: "utf8mb4",
          logging: ['error'],
          migrations: [],
          paths: {
            migration: path.resolve(__dirname, "../../database/migrations"),
          },
        },
        options.common ?? {},
        "replace"
        ),
        // 加一个default数据库连接
        connections: createConnectionOptions(options.connections ?? [])
      }
      // console.log("new Options", newOptions)
      // 将common合并到connections中
    // @ts-ignore
    newOptions.connections = newOptions.connections.map((connection) => {
        // entities可能没传
        const entities = connection.entities ?? [];
        const newOption = { ...connection, entities };
        return deepMerge(
              newOptions.common,
              {
                  ...newOption,
                  // synchronize: configure.getRunEnv() !== EnvironmentType.PRODUCTION,
                  // 取消自动同步entity的结构到数据库中
                  synchronize: false,
                  autoLoadEntities: true
              } as any,
              "replace"
        )
    });
    return newOptions as unknown as DbConfig;
}

/**
 * 数据库模块配置
 * @param register 
 */
export const createDbConfig: (
    register: ConfigureRegister<RePartial<DbConfigOptions>>
) => ConfigureFactory<RePartial<DbConfigOptions>, DbConfig> = (register) => {
    return {
        register,
        defaultRegister: (configure) => ({
            common: {
              charset: "utf8mb4",
              logging: ['error'],
            },
            connections: []
        }),
        hook: (_, value) => createDbOptions(_, value as DbConfigOptions)
    }
}

/**
 * 在模块上注册entity
 * @param entities 
 * @param dataSource 数据库连接名称
 */
export const addEntities = async (
    configure: Configure,
    entities: EntityClassOrSchema[] = [], 
    dataSource = "default"
) => {
    const database = await configure.get<DbConfig>("database");
    if (isNil(database)) throw new Error("Typeorm没有配置！");
    // 对应的数据库连接为空
    // console.log(chalk.red("database"), database);
    // console.log("entities", entities)
    const dbConfig = database.connections.find(({name}) => name === dataSource);
    if (isNil(dbConfig)) throw new Error(`数据库连接${dataSource}不存在`);

    // 数据库中配置的entities
    const oldEntities = (dbConfig.entities ?? []) as ObjectLiteral[];

    const es = await Promise.all(
      entities.map(async entity => {
        // 装饰器的动态关联
        const registerRelation = Reflect.getMetadata(DYNAMIC_RELATIONS, entity);
        // 判断传入的entity是不是类
        if ('prototype' in entity && !isNil(registerRelation) && typeof registerRelation === "function") {
          // 取出relations
          const relations: DynamicRelation[] = await registerRelation();
          relations.forEach(({ column, relation, others }) => {
            // 先加上字段
            const property = Object.getOwnPropertyDescriptor(entity.prototype, column);
            if (isNil(property)) {
              // 字段不存在，加上这个字段
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
  )

  /**
   * 更新数据库配置，添加上entities
   */
  configure.set("database.connections", 
    database.connections.map(c => 
      c.name === dataSource ? {
        ...c,
        entities: [...oldEntities, ...es]
      } :
      c
    )
  )

  return TypeOrmModule.forFeature(es, dataSource);
}

/**
 * 在模块上注册订阅者
 * @param configure 配置类实例
 * @param subscribers 订阅者列表
 * @param dataSource 数据库连接名称
 */
export const addSubscribers = async (
  configure: Configure,
  subscribers: Type<any>[] = [],
  dataSource = 'default',
) => {
  const database = await configure.get<DbConfig>('database');
  if (isNil(database)) throw new Error(`Typeorm have not any config!`);
  const dbConfig = database.connections.find(({ name }) => name === dataSource);
  if (isNil(dbConfig)) throw new Error('Database connection named' + dataSource + 'not exists!');
  const oldSubscribers = (dbConfig.subscribers ?? []) as any[];
  /**
   * 更新数据库配置,添加上新的订阅者
   */
  configure.set(
      'database.connections',
      database.connections.map((connection) =>
          connection.name === dataSource
              ? {
                    ...connection,
                    subscribers: [...oldSubscribers, ...subscribers],
                }
              : connection,
      ),
  );
  return subscribers;
};

/**
 * 处理entity的排序
 * @param qb sql语句
 * @param alias repo别名
 * @param orderBy 排序字段
 */
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
 * 获取自定义Repository的实例
 * @param dataSource 数据连接池
 * @param Repo repository类
 */
export const getCustomRepository = <T extends Repository<E>, E extends ObjectLiteral>(
  dataSource: DataSource,
  Repo: ClassType<T>,
): T => {
  if (isNil(Repo)) return null;
  const entity = Reflect.getMetadata(CUSTOM_REPOSITORY_METADATA, Repo);
  if (!entity) return null;
  const base = dataSource.getRepository<ObjectType<any>>(entity);
  return new Repo(base.target, base.manager, base.queryRunner) as T;
};

