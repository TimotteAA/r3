import { resolve } from "path";
import fs, { readFileSync, writeFileSync } from "fs";
import { isNil, isFunction, has, get, set, omit } from "lodash";
import findUp from "find-up";
import dotenv from "dotenv";
import { ensureFileSync } from "fs-extra";
import * as YAML from "yaml";

import { EnvironmentType } from "./constants";
import { ConfigureFactory, ConfigureRegister, ConfigStorageOption } from "./types";
import { isAsyncFunction } from "./helpers";
import { deepMerge } from "../utils";
import { ConfigNotFoundException } from "./errors";

export class Configure {
    /**
     * 配置是否被初始化 
     */
    protected inited = false;
    
    /**
     * 生成的配置
     */
    protected config: Record<string, any> = {};

    /**
     * 各个模块的配置构造器
     */
    protected factories?: Record<string, ConfigureFactory<Record<string, any>>> = {}

    /**
     * 使用yml存储的配置
     */
    protected ymlConfig: Record<string, any> = {};

    /**
     * 是否在本地存储yaml配置
     */
    protected storage = false;

    /**
     * 本地存储路径
     */
    protected yamlPath = resolve(__dirname, "../../../", "config.yml");

    constructor() {
        // 原来在config中的两步
        this.setRunEnv();
        // 读取.env，并设置环境变量到process.env中
        this.loadEnvs()
        // console.log(chalk.green("processe env"), process.env)
    }       

    /**
     * 获取当前允许环境
     */
    getRunEnv(): EnvironmentType {
        return process.env.NODE_ENV as EnvironmentType;
    }
    
    /**
     * 获取所有配置
     */
    all() {
        return this.config;
    }

    

    /**
     * 设置运行环境
     * 如果不通过cress-env来设置，则默认当前是生产环境
     */
    protected setRunEnv() {
        if (isNil(process.env.NODE_ENV) || !Object.values(EnvironmentType).includes(process.env.NODE_ENV as EnvironmentType)) {
          // 默认是生产模式
          process.env.NODE_ENV = EnvironmentType.PRODUCTION
        }   
    }

    protected loadEnvs() {
        // 默认为生产模式
        if (!process.env.NODE_ENV) {
            process.env.NODE_ENV = EnvironmentType.PRODUCTION
        }
        // .env文件
        const searchs = [findUp.sync('.env')];
        // 非生产环境，读取对应的配置文件: .env.development、.env.preview
        if (process.env.NODE_ENV !== EnvironmentType.PRODUCTION) {
            searchs.push(findUp.sync(`.env.${process.env.NODE_ENV}`));
        }
        const envFiles = searchs.filter(file => file !== undefined) as string[];
        // 所有的环境变量进行读取，并进行合并
        const envs = envFiles.map(file => dotenv.parse(fs.readFileSync(file))).reduce((oc, nc) => ({...oc, ...nc}), {});
        // 与process.env的环境变量合并
        const finalEnvs = {...process.env, ...envs};
        // 过滤在envs中存在，而在process.env中不存在的
        const keys = Object.keys(finalEnvs).filter((key) => !(key in process.env));
        // 将不存在的放到process.env上去
        keys.forEach(key => {
            process.env[key] = finalEnvs[key];
        })
    }

    /**
     * 获取全部环境变量
     *
     * @returns {{ [key: string]: string }}
     */
    env(): { [key: string]: string };

    /**
     * 直接获取某个环境变量
     *
     * @template T
     * @param {string} key
     * @returns {T}
     */
    env<T extends BaseType = string>(key: string): T;

    /**
     * 获取key的环境变量，并转义
     * @param key 
     * @param parseTo 
     */
    env<T extends BaseType = string>(key: string, parseTo: ParseType<T>): T;

    /**
     * 获取key的环境变量，不存在则获得传入的默认值
     * @param key 
     * @param defaultValue 
     */
    env<T extends BaseType = string>(key: string, defaultValue: T): T;

    /**
     * 获取类型转义后的环境变量,不存在则获取默认值
     * @param key 
     * @param parseTo 
     * @param defaultValue 
     */
    env<T extends BaseType = string>(
        key: string,
        parseTo: ParseType<T>,
        defaultValue: T,
    ): T;

    env<T extends BaseType = string>(
        key?: string,
        parseTo?: ParseType<T> | T,
        defaultValue?: T,
    ) {
        // 获取全部的环境变量
        if (!key) return process.env;
        // 获取值
        const value = process.env[key];
        // 值存在，判断是否转义
        if (value !== undefined) {
            if (parseTo && isFunction(parseTo)) {
                return parseTo(value);
            }
            return value as T;
        }
        // 值不存在
        if (parseTo === undefined && defaultValue === undefined) {
            return undefined;
        }
        if (parseTo && defaultValue === undefined) {
            return isFunction(parseTo) ? undefined : parseTo;
        }
        return defaultValue! as T;
    }
    
    /**
     * 同步某一模块的配置，执行其工厂构造器
     * @param key 
     */
    protected async syncFactory(key: string) {
        // 配置注册器需要configure服务类
        if (has(this.config, key)) return this;
        // 从构造器工厂中提取
        const { register, defaultRegister, storage, hook, append } = this.factories[key];
        let value = isAsyncFunction(register) ? await register(this) : register(this);
        let defaultValue = {};
        if (!isNil(defaultRegister)) {
            defaultValue = isAsyncFunction(defaultRegister) ?
                await defaultRegister(this) : defaultRegister(this)
            // 'replace'数组好像会积极 
            value = deepMerge(value, defaultValue, 'merge')
        }
        // if (key === "database") {
        //     console.log("defaultValue", defaultValue);
        //     console.log("register", register);
        //     console.log("value", value)
        // }
        if (!isNil(hook)) {
            value = isAsyncFunction(hook) ? await hook(this, value) : hook(this, value);
        }
        this.set(key, value, storage && isNil(await this.get(key, null)), append);
        return this;
    }

    // 配置crud

    /**
     * 配置某个模块配置是否存在
     * @param key 
     */
    has(key: string) {
        return has(this.config, key);
    }

    /**
     * 添加一个模块配置集
     * @param key 
     * @param register 
     */
    add<T extends Record<string, any>>(
        key: string,
        register: ConfigureFactory<T> | ConfigureRegister<T>
    ) {
        if ('register' in register && !isFunction(register)) {
            // 复杂配置工厂
            this.factories[key] = register as any;
        } else {
            // 简单配置工厂
            this.factories[key] = { register }
        }
        return this;
    }

    /**
     * 添加配置后，同步该模块的配置到配置中
     * @param name 
     */
    async sync(name?: string) {
        if (!isNil(name)) await this.syncFactory(name);
        else {
            for (const key in this.factories) {
                // console.log("key", key);
                await this.syncFactory(key);
            }
        }
        // console.log("config", this.config)
    }

    // 下面的方法用于动态存储

    /**
     * 初始化动态存储配置
     * @param option 
     */
    init(option: ConfigStorageOption = {}) {
        // 已经配置过
        if (this.inited) return this;
        const { storage, ymlPath } = option;
        if (!isNil(storage)) this.storage = storage;
        if (!isNil(ymlPath)) this.yamlPath = ymlPath;
        if (this.storage) this.enableStorage();
        this.inited = true;
        return this;
    }

    protected enableStorage() {
        this.storage = true;

        // 确保yamlPath存在
        ensureFileSync(this.yamlPath);
        // 读取其中的配置
        const ymlConfig = YAML.parse(readFileSync(this.yamlPath, "utf8"));
        // 合并到内存中
        this.ymlConfig = isNil(ymlConfig) ? {} : ymlConfig;
        this.config = deepMerge(this.config, this.yamlPath, "replace")
    }

    /**
     * 设置一个配置集
     * @param key 配置名
     * @param value 集合名
     * @param storage 是否动态存储
     * @param append 
     */
    set<T>(key: string, value: T, storage = false, append =false) {
        if (storage && this.storage) {
            // 开启了动态配置，且这个配置进行动态存储
            // 确保文件存在
            ensureFileSync(this.yamlPath);
            // 合并到yamlConfig中
            set(this.ymlConfig, key, value);
            // xiedaoneicunz
            writeFileSync(this.yamlPath, JSON.stringify(this.ymlConfig));
            this.config = deepMerge(this.config, this.yamlPath, append ? "merge" : "replace")
        } else {
            set(this.config, key, value);
            // console.log('after set', this.config.database)
        }
        return this;
    }

    /**
     * 获取某一模块的配置集
     * @param key 
     * @param defaultValue 
     */
    async get<T>(key: string, defaultValue?: T): Promise<T> {
        // 配置中没有，也没传默认值，但配置工厂中有
        if (!has(this.config, key) && defaultValue === undefined && has(this.factories, key)) {
            await this.syncFactory(key);
            return this.get(key, defaultValue);
        }

        return get(this.config, key, defaultValue) as T;
    }

    /**
     * 手动指定this.config中的某个Key配置进行动态存储
     * @param key 
     */
    async store(key: string) {
        if (!this.storage) throw new Error("存储配置前必须开启storage")
        if (!has(this.config, key)) throw new ConfigNotFoundException(`${key}的配置不存在`);
        ensureFileSync(this.yamlPath);
        set(this.ymlConfig, key, await this.get(key));
        writeFileSync(this.yamlPath, JSON.stringify(this.ymlConfig, null, 4));
        this.config = deepMerge(this.config, this.ymlConfig, "replace");
        return this;
    }

    /**
     * 删除指定key的配置
     * @param key 
     */
    remove(key: string) {
        if (has(this.config, key)) {
            // 直接删
            this.config = omit(this.config, [key]);
        } else if (has(this.config, key) && this.storage) {
            // yml中存储的配置集也删除
            this.ymlConfig = omit(this.ymlConfig, [key]);
            writeFileSync(this.yamlPath, JSON.stringify(this.ymlConfig));
            this.config = deepMerge(this.config, this.ymlConfig, "replace");
        }

        return this;
    }
}