import { DynamicModule, Type, Provider, ModuleMetadata } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CUSTOM_REPOSITORY_METADATA } from '@/modules/database/constants';
import { DataSource } from 'typeorm';

import {
    IsExistConstraint,
    IsUniqueConstraint,
    IsUniqueUpdateConstraint,
    IsUniqueTreeConstraint,
    IsUniqueTreeUpdateConstraint,
} from './constraints';
import { ModuleBuilder } from '../core/decorators';
import { DbConfig } from './types';

import * as commandMaps from "./commands";


@ModuleBuilder(async configure => {
    if (!configure.has("database")) {
        throw new Error("数据库配置不存在")
    }
    const imports: ModuleMetadata['imports'] = [];
    const options = await configure.get<DbConfig>("database");
    for (const connection of options.connections) {
        // 去掉了migration与name
        imports.push(TypeOrmModule.forRoot(connection as TypeOrmModuleOptions))
    };
    return {
        global: true,
        // module: DatabaseModule,
        imports,
        providers: [
            IsExistConstraint,
            IsUniqueConstraint,
            IsUniqueUpdateConstraint,
            IsUniqueTreeConstraint,
            IsUniqueTreeUpdateConstraint,
        ],
        commands: Object.values(commandMaps)
    };
})
export class DatabaseModule {
    // 注册自定义Repository类
    static forRepository<T extends Type<any>>(repos: T[], dataSourceName?: string): DynamicModule {
        // 自定义的Repo类，进行暴露
        const providers: Provider[] = [];

        // 遍历自定义Repo类
        for (const Repo of repos) {
            // 类装饰器，定义的Entity
            const entity = Reflect.getMetadata(CUSTOM_REPOSITORY_METADATA, Repo);
            if (!entity) {
                // 不是自定义Repo类
                continue;
            }

            providers.push({
                inject: [getDataSourceToken(dataSourceName)],
                provide: Repo,
                useFactory: (dataSource: DataSource): InstanceType<typeof Repo> => {
                    // 获取原生的Repository
                    const origin = dataSource.getRepository(entity);
                    // 自定义的Repository继承了Repo类,传入父类的参数,调用父类的构造函数
                    return new Repo(origin.target, origin.manager, origin.queryRunner);
                },
            });
        }

        return {
            exports: providers,
            module: DatabaseModule,
            providers,
        };
    }
}
