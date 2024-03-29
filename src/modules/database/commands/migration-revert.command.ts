import yargs from 'yargs';

import { CommandItem } from '@/modules/database/types';

import { MigrationRevertArguments } from '../types';

import { MigrationRevertHandler } from './migration-revert.handler';

/**
 * 恢复迁移命令
 * @param param0
 */
export const RevertMigrationCommand: CommandItem<any, MigrationRevertArguments> = ({
    configure,
}) => ({
    source: true,
    command: ['db:migration:revert', 'dbmv'],
    describe: 'Reverts last executed migration.（回滚到上次的数据库迁移前的状态）',
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
    } as const,

    handler: async (args: yargs.Arguments<MigrationRevertArguments>) =>
        MigrationRevertHandler(configure, args),
});
