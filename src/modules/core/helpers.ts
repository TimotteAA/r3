import { Module, ModuleMetadata, Type } from "@nestjs/common";
import { isNil, isArray, isObject, toNumber } from "lodash";

import { deepMerge } from "../utils";
import { ConfigureRegister, ConnectionOption, ConnectionRst, AppConfig, ConfigureFactory } from "./types";

export function mergeMeta(meta: ModuleMetadata, custom: ModuleMetadata) {
    const keys = Array.from(new Set([...Object.keys(meta), ...Object.keys(custom)]));
    const useMerge = <T>(i: T, p: T) => {
        // 数组合并
        if (isArray(p)) return [...((i as any[]) ?? []), ...((p as any[]) ?? [])];
        // 对象深度合并
        if (isObject(p)) return deepMerge(i, p);
        return p;
    };
    const merged = Object.fromEntries(
        keys
            .map((type) => [
                type,
                useMerge(meta[type as keyof ModuleMetadata], custom[type as keyof ModuleMetadata]),
            ])
            .filter(([_, item]) => (isArray(item) ? item.length > 0 : !!item)),
    );
    return { ...meta, ...merged };
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
    // console.log(target, moduleMetadataSetter())
    Module(moduleMetadataSetter())(ModuleClass);
    return ModuleClass;
}

export function isAsyncFunction<R, A extends any[]>(
    callback: (...args: A) => Promise<R> | R
): callback is (...args: A) => Promise<R> {
    const AsyncFunction = (async () => {}).constructor;
    return callback instanceof AsyncFunction === true;
}

/**
 * typeorm、redis的链接配置加工
 * @param options 
 */
export const createConnectionOptions = <T extends Record<string, any>>(
    options: ConnectionOption<T>,
): ConnectionRst<T> => {
    const config: ConnectionRst<T> = Array.isArray(options) 
        ? options 
        : [{ ...options, name: "default" }]
    if (config.length <= 0) return undefined;
    if (isNil(config.find(({name}) => name === "default"))) {
        config[0].name = "default"
    }

    // 根据name去重
    return config.reduce((o, n) => {
        if (o.map(({name}) => name).includes(n.name)) return o;
        return [...o, n]
    }, [])
}

/**
 * 创建app配置
 * @param register 
 */
export const createAppConfig: (configure: ConfigureRegister<Partial<AppConfig>>)
=> ConfigureFactory<Partial<AppConfig>, AppConfig> = (register) => ({
    register,
    defaultRegister: configure => ({
        websockets: true,
        port: configure.env("APP_PORT", toNumber, 3100),
        host: configure.env("APP_HOST", "127.0.0.1"),
        https: configure.env("APP_HTTPS", toBoolean, false)
    })
})

/**
 * 对请求的入参（可能是字符串或者boolean)进行转换
 * @param value
 * @returns
 */
export function toBoolean(value?: string | boolean): boolean {
    if (isNil(value)) return false;
    if (typeof value === 'boolean') return value;
    try {
        return JSON.parse(value.toLowerCase());
    } catch (e) {
        return value as unknown as boolean;
    }
}
