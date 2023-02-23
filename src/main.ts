import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { boot, createApp } from '@/modules/utils/app';

import * as configs from "./modules/configs"

import { ContentModule } from './modules/content/content.module';
import { MediaModule } from './modules/media/media.module';

import { RbacGuard } from './modules/rbac/guards';
import { RbacModule } from './modules/rbac/rbac.module';
// import { RestfulFactory } from './modules/restful/factory';
// import { echoApi } from './modules/restful/helpers';
import { UserModule } from './modules/user/user.module';


// console.log("初始配置集", configs)

// 创建app
const creator = createApp({
    configs,
    configure: { storage: false },
    modules: [ContentModule, MediaModule, UserModule, RbacModule],
    globals: { guard: RbacGuard },
    builder: async ({ configure, BootModule }) => {
        return NestFactory.create<NestFastifyApplication>(BootModule, new FastifyAdapter(), {
            cors: true,
            logger: ['warn'],
        });
    },
});

// 启动创建出的app
boot(creator);
