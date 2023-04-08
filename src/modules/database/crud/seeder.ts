import { DataSource, EntityManager, EntityTarget, ObjectLiteral } from "typeorm";

import { DbFactory, DbFactoryOption, Seeder, SeederConstructor, SeederLoadParams, SeederOptions } from "../types"; 
import { Configure } from "@/modules/core/configure";
import { Ora } from "ora";
import { EnvironmentType } from "@/modules/core/constants";
import { factoryBuilder } from "../helpers";

/**
 * Seeder基类
 */
export abstract class BaseSeeder implements Seeder {
    protected dataSource: DataSource;

    protected em: EntityManager;

    protected connection: string;

    protected configure: Configure;

    protected factories!: {
        [entityName: string]: DbFactoryOption<any, any>;
    }

    /**
     * 填充前需要清空的数据表对应的模型类
     */
    protected truncates: EntityTarget<ObjectLiteral>[] = [];

    constructor(protected spinner: Ora, protected args: SeederOptions) {}

    /**
     * 清空原数据并重新加载数据
     * @param param
     */
    async load({ dataSource, em, connection, configure, factories, factorier }: SeederLoadParams): Promise<any> {
        this.connection = connection;
        this.configure = configure;
        this.em = em;
        this.dataSource = dataSource;
        this.factories = factories;

        // 开发环境下清空数据库 
        if (this.configure.getRunEnv() !== EnvironmentType.PRODUCTION) {
            for (const truncate of this.truncates) {
                await this.em.clear(truncate);
            }
        }

        const result = await this.run(factorier, this.dataSource);
        return result;
    }

    protected abstract run(
        factorier?: DbFactory,
        dataSource?: DataSource, 
        em?: EntityManager
    ): Promise<any>;

    /**
     * 入口
     * 运行子seeder
     * @param SubSeeder 
     */
    protected async call(SubSeeder: SeederConstructor) {
        const subSeeder: Seeder = new SubSeeder(this.spinner, this.args);
        await subSeeder.load({
            connection: this.connection,
            dataSource: this.dataSource,
            em: this.em,
            configure: this.configure,
            factories: this.factories,
            factorier: factoryBuilder(this.dataSource, this.factories)
        })
    }
}