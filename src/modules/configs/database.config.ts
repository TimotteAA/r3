import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const configFn: () => TypeOrmModuleOptions = () => {
    return {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '64556398aa',
        database: '3r',
        // 开发环境自动同步
        synchronize: true,
        // 自动加载entities
        autoLoadEntities: true,
        // 日志显示logging error之上的
        logging: ['error'],
        // 字符集
        charset: 'utf8mb4',
    };
};
export { configFn };
