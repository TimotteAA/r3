import { createDbConfig } from "../modules/database/helpers";

/**
 * 只需配置连接项
 */
export const database = createDbConfig((register) => {
    // console.log("asdasda", register);
    return {
        connections: [
            {
                type: 'mysql',
                host: register.env("DB_HOST"),
                port: register.env("DB_PORT", 3307),
                username:  register.env("DB_USER"),
                password: register.env("DB_AUTH"),
                database: register.env("DB_DATABASE"),
                // // 开发环境自动同步
                synchronize: true,
                // // 自动加载entities
                // autoLoadEntities: true,
            }
        ]
    }
})
