import { DataSource } from 'typeorm';

import { MigrationRunOptions } from '../types';

type HandlerOptions = MigrationRunOptions & { dataSource: DataSource };
/**
 * 修改自：https://github.com/typeorm/typeorm/blob/master/src/commands/MigrationRunCommand.ts
 */
export class TypeormMigrationRun {
    async handler({ transaction, fake, dataSource }: HandlerOptions) {
        const options = {
            transaction:
                dataSource.options.migrationsTransactionMode ?? ('all' as 'all' | 'none' | 'each'),
            fake,
        };
        switch (transaction) {
            case 'all':
                options.transaction = 'all';
                break;
            case 'none':
            case 'false':
                options.transaction = 'none';
                break;
            case 'each':
                options.transaction = 'each';
                break;
            default:
            // noop
        }

        await dataSource.runMigrations(options);
    }
}
