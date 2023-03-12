import yargs from "yargs";

import { CommandItem } from "../types";
import { MigrationRunArguments } from "../types"; 
import { MigrationRunHandler } from "./migration-run.handler";

/**
 * 运行迁移的命令
 * @param param0 
 */
export const RunMigrationCommand: CommandItem<any, MigrationRunArguments> = ({ configure }) => ({
    source: true,
    command: ['db:migration:run', 'dbmr'],
    describe: 'Runs all pending migrations.（运行迁移文件，-r刷新数据，-o删除数据）',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Connection name of typeorm to connect database.',
        },
        transaction: {
            type: 'string',
            alias: 't',
            describe:
                'Indicates if transaction should be used or not for migration run/revert/reflash. Enabled by default.',
            default: 'default',
        },
        fake: {
            type: 'boolean',
            alias: 'f',
            describe:
                'Fakes running the migrations if table schema has already been changed manually or externally ' +
                '(e.g. through another project)',
        },
        refresh: {
            type: 'boolean',
            alias: 'r',
            describe: 'drop database schema and run migration',
            default: false,
        },
        onlydrop: {
            type: 'boolean',
            alias: 'o',
            describe: 'only drop database schema',
            default: false,
        },
    } as const,

    handler: async (args: yargs.Arguments<MigrationRunArguments>) =>
        MigrationRunHandler(configure, args),
});