import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { createApp } from '@/modules/utils/app';

import * as configs from "./configs"

import { ContentModule } from './modules/content/content.module';
import { MediaModule } from './modules/media/media.module';

import { RbacGuard } from './modules/rbac/guards';
import { RbacModule } from './modules/rbac/rbac.module';
import { CoreModule } from './modules/core/core.module';
import { UserModule } from './modules/user/user.module';
import { ActionModule } from './modules/actions/action.module';

// 创建app
export const creator = createApp({
    configs,
    configure: { storage: false },
    // 非核心模块的导入模块
    modules: [MediaModule, UserModule, RbacModule, CoreModule, ActionModule, ContentModule],
    // 全局的管道、filter、guard等
    globals: { guard: RbacGuard },
    builder: async ({ configure, BootModule }) => {
        return NestFactory.create<NestFastifyApplication>(BootModule, new FastifyAdapter(), {
            cors: true,
            logger: ['warn'],
        });
    },
});