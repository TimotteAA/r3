import { Module, ModuleMetadata, Type } from "@nestjs/common";
import chalk from "chalk";
import { isNil, isArray, isObject, toNumber } from "lodash";
import yargs, { CommandModule } from "yargs";

import { CommandItem } from "../database/types";
import { deepMerge } from "../utils";
import { ConfigureRegister, ConnectionOption, ConnectionRst, AppConfig, ConfigureFactory, PanicOption, CreatorData } from "./types";

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
        https: configure.env("APP_HTTPS", toBoolean, false),
        timezone: configure.env("APP_TIMEZONE", "Asia/Shanghai"),
        locale: configure.env("APP_LOCALE", 'zh-cn')
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

/**
 * 加工处理各个模块定义的command
 * @param params 
 */
export async function createCommands(params: CreatorData): Promise<CommandModule<any, any>[]> {
    const { app, modules } = params;
    // 每个模块上的命令
    const moduleCommands: Array<CommandItem<any, any>> = Object.values(modules)
        .map((m) => m.meta.commands ?? [])
        .reduce((o, n) => [...o, ...n], []);

    const commands = [...params.commands, ...moduleCommands].map((item) => {
        const command = item(params);
        return {
            ...command,
            handler: async (args: yargs.Arguments<any>) => {
                const handler = command.handler as (
                    ...argsb: yargs.Arguments<any>
                ) => Promise<void>;
                await handler({ ...params, ...args });
                await app.close();
                process.exit();
            }
        }
    });
    return commands;
}

/**
 * 构建cli
 * @param builder 
 */
export async function buildCli(builder: () => Promise<CreatorData>) {
    const params = await builder();
    const commands = await createCommands(params);
    // console.log("111111111111111111111111111111");
    console.log()
    // console.error("1231412412412")
    // 注册命令
    commands.forEach((command) => yargs.command(command));
    // 注册对应的handler
    yargs
        .usage('Usage: $0 <command> [options]')
        .scriptName("cli")
        .demandCommand(1, '')
        .fail((msg, err, y) => {
            if (!msg && !err) {
                yargs.showHelp();
                process.exit;
            }
            if (msg) console.error(chalk.red(msg));
            if (err) console.error(chalk.red(err.message));
            process.exit()
        })
        .strict()
        .alias('v', 'version')
        .help('h')
        .alias('h', 'help').argv
}

/**
 * 处理命令报错的函数
 * @param option 
 */
export function panic(option: PanicOption | string) {
    console.log();
    if (typeof option === "string") {
        console.log(chalk.red(`\n❌ ${option}`));
        process.exit(1);
    }
    const { error, spinner, message, exit = true } = option;
    if (error) console.log(chalk.red(error));
    spinner ? spinner.fail(chalk.red(`\n❌ ${message}`)) : console.log(chalk.red(`\n❌ ${message}`));
    if (exit) process.exit(1);
}

/**
 * 生成固定长度的仅包含字母的字符串
 * @param length 
 */
export const getRandomCharString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}