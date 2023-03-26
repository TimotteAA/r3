import { DataSource } from "typeorm";
import { Type } from "@nestjs/common";
import { resolve } from "path";
import { ensureFileSync, readFileSync, writeFileSync } from "fs-extra";
import * as YAML from "yaml";
import { isNil, get, set } from "lodash";

import { BaseSeeder } from "../crud/seeder";
import { getDbConfig } from "../helpers";
import { EnvironmentType } from "@/modules/core/constants";
import { DbFactory } from "../types";

/**
 * seed入口类，类似于RbacResolver
 */
export class SeedResolver extends BaseSeeder {
    public async run(_factory: DbFactory, _dataSource: DataSource): Promise<any> {
        let seeders: Type<any>[] = ((await getDbConfig(this.connection)) as any).seeders ?? [];
        if (this.configure.getRunEnv() === EnvironmentType.PRODUCTION) {
            const seedLockFile = resolve(__dirname, "../../../../", 'seed-lock.yml');
            ensureFileSync(seedLockFile);
            const yml = YAML.parse(readFileSync(seedLockFile, 'utf-8'));
            const locked = isNil(yml) ? {} : yml;
            const lockNames = get<string[]>(locked, this.connection, []).reduce<string[]>(
                (o, n) => (o.includes(n) ? o : [...o, n]),
                [],
            )
            seeders = seeders.filter((s) => !lockNames.includes(s.name));
            for (const seeder of seeders) {
                await this.call(seeder);
            }
            set(locked, this.connection, [
                ...lockNames.filter((n) => !isNil(n)),
                ...seeders.map((s) => s.name).filter((n) => !isNil(n)),
            ]);
            writeFileSync(seedLockFile, JSON.stringify(locked, null, 4));
        } else {
            // 开发环境
            for (const seeder of seeders) {
                await this.call(seeder);
            }
        }
    }
}