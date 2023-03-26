import yargs from "yargs";

import { CommandItem, SeederArguments } from "../types";
import { SeedHandler } from "./seed.handler";

export const SeedCommad: CommandItem<any, SeederArguments> = ({ configure }) => ({
    command: ['db:seed'],
    describe: '运行所有的seed',
    builder: {
        clear: {
            type: 'boolean',
            alias: 'r',
            describe: 'Clear which tables will truncated specified by seeder class.',
            default: true,
        },
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Connection name of typeorm to connect database.',
        },
        transaction: {
            type: 'boolean',
            alias: 't',
            describe: ' If is seed data in transaction,default is true',
            default: true,
        },
    },

    handler: async (args: yargs.Arguments<SeederArguments>) => SeedHandler(args, configure)
})