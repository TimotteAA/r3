import fs from "node:fs";
import findUp from "find-up";
import dotenv from "dotenv";
import { EnvironmentType } from "./constants";
import { isNil, isFunction } from "lodash";

export const setEnv = () => {
  if (isNil(process.env.NODE_ENV) || Object.values(EnvironmentType).includes(process.env.NODE_ENV as EnvironmentType)) {
    // 默认是生产模式
    process.env.NODE_ENV = EnvironmentType.PRODUCTION
  }
}
export const getEnv = () => {
  setEnv();
  return process.env.NODE_ENV as EnvironmentType;
}

/**
 * 读取.env.*的环境变量到process.env中
 */
export const loadEnvs = () => {
  // 默认为生产模式
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = EnvironmentType.PRODUCTION
  }
  // .env文件
  const searchs = [findUp.sync('.env')];
  // 非生产环境，读取对应的配置文件
  if (process.env.NODE_ENV !== EnvironmentType.PRODUCTION) {
    searchs.push(findUp.sync(`.env.${process.env.NODE_ENV}`));
  }
  const envFiles = searchs.filter(file => file !== undefined) as string[];
  // 所有的环境变量
  const envs = envFiles.map(file => dotenv.parse(fs.readFileSync(file))).reduce((oc, nc) => ({...oc, ...nc}), {});
  // 与当前系统环境变量合并
  const finalEnvs = {...process.env, ...envs};
  // 过滤在envs中存在，而在process.env中不存在的
  const keys = Object.keys(finalEnvs).filter((key) => !(key in process.env));
  // 放到process.env上去
  keys.forEach(key => {
    process.env[key] = finalEnvs[key];
  })
}

// 基础类型接口
type BaseType = boolean | number | string | undefined | null;
// 环境变量类型转义函数接口
type ParseType<T extends BaseType = string> = (value: string) => T;

/**
 * 获取全部环境变量
 *
 * @export
 * @returns {{ [key: string]: string }}
 */
export function env(): { [key: string]: string };
/**
 * 直接获取环境变量
 *
 * @export
 * @template T
 * @param {string} key
 * @returns {T}
 */
export function env<T extends BaseType = string>(key: string): T;

/**
 * 获取类型转义后的环境变量
 *
 * @export
 * @template T
 * @param {string} key
 * @param {ParseType<T>} parseTo
 * @returns {T}
 */
export function env<T extends BaseType = string>(key: string, parseTo: ParseType<T>): T;

/**
 *获取环境变量,不存在则获取默认值
 *
 * @export
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {T}
 */
export function env<T extends BaseType = string>(key: string, defaultValue: T): T;

/**
 *获取类型转义后的环境变量,不存在则获取默认值
 *
 * @export
 * @template T
 * @param {string} key
 * @param {ParseType<T>} parseTo
 * @param {T} defaultValue
 * @returns {T}
 */
export function env<T extends BaseType = string>(
    key: string,
    parseTo: ParseType<T>,
    defaultValue: T,
): T;

/**
 * 获取环境变量的具体实现
 *
 * @export
 * @template T
 * @param {string} key
 * @param {(ParseType<T> | T)} [parseTo]
 * @param {T} [defaultValue]
 * @returns
 */
export function env<T extends BaseType = string>(
    key?: string,
    parseTo?: ParseType<T> | T,
    defaultValue?: T,
) {
    if (!key) return process.env;
    const value = process.env[key];
    if (value !== undefined) {
        if (parseTo && isFunction(parseTo)) {
            return parseTo(value);
        }
        return value as T;
    }
    if (parseTo === undefined && defaultValue === undefined) {
        return undefined;
    }
    if (parseTo && defaultValue === undefined) {
        return isFunction(parseTo) ? undefined : parseTo;
    }
    return defaultValue! as T;
}