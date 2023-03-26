import ora from "ora";

import { Configure } from "@/modules/core/configure";
import { getDbConfig, runSeeder } from "../helpers";
import { SeedResolver } from "../resolver";
import { SeederOptions } from "../types";
import { panic } from "@/modules/core/helpers";

/**
 * Seeder命令处理器
 * @param args 
 * @param configure 
 */
export const SeedHandler = async (args: SeederOptions, configure: Configure) => {
    // seed入口类
    const runner = (await getDbConfig(args.connection)).seedRunner ?? SeedResolver;
    const spinner = ora(`Start run seeder`);
    try {
        spinner.start();
        await runSeeder(runner, args, spinner, configure);
    } catch (error) {
        panic({ spinner, message: `Run seeder failed`, error })
    }
}