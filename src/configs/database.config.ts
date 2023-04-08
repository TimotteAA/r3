import { createDbConfig } from "../modules/database/helpers";

import ContentSeeder from "@/database/seeders/content.seeder";
import { ContentFactory } from "@/database/factories/content.factory";

import { UserFactory } from "@/database/factories/user.factory";
import UserSeeder from "@/database/seeders/user.seeder";

/**
 * 只需配置连接项
 */
export const database = createDbConfig((configure) => {
    // console.log("asdasda", register);
    return {
        connections: [
            {
                type: 'mysql',
                host: configure.env("DB_HOST"),
                port: configure.env("DB_PORT", 3307),
                username:  configure.env("DB_USER"),
                password: configure.env("DB_AUTH"),
                database: configure.env("DB_DATABASE"),
                // // 开发环境自动同步
                // synchronize: true,
                // // // 自动加载entities
                // autoLoadEntities: true,
                seeders: [ContentSeeder, UserSeeder],
                factories: [ContentFactory, UserFactory]
            }
        ]
    }
})
