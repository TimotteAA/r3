import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenEntity, RefreshTokenEntity, UserEntity, CodeEntity } from './entities';
import { UserSubscriber } from './subscribers';
import { DatabaseModule } from '../database/database.module';
import { UserRepository } from './repositorys';
import { AuthService } from './services';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthGuard, JwtAuthGuard } from './guards';
import { SEND_CAPTCHA_QUEUE } from '@/modules/utils';


import * as controllerMaps from './controller';
import * as strategiesMap from './strategies';
import * as serviceMaps from './services';
import * as queueMaps from "./queues";
import { BullModule } from '@nestjs/bullmq';

const services = Object.values(serviceMaps);
const strategies = Object.values(strategiesMap);
const controllers = Object.values(controllerMaps);
const queues = Object.values(queueMaps);

@Module({
    controllers: [...controllers],
    imports: [
        TypeOrmModule.forFeature([AccessTokenEntity, RefreshTokenEntity, UserEntity, CodeEntity]),
        DatabaseModule.forRepository([UserRepository]),
        PassportModule,
        AuthService.registerJwtModule(),
        BullModule.registerQueue({name: SEND_CAPTCHA_QUEUE})
    ],
    providers: [
        UserSubscriber,
        ...strategies,
        ...services,
        LocalAuthGuard,
        JwtAuthGuard,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        ...queues
    ],
    exports: [...services, ...queues],
})
export class UserModule {}
