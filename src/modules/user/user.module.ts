import { forwardRef } from '@nestjs/common';
import { AccessTokenEntity, RefreshTokenEntity, UserEntity, CodeEntity, MessageEntity, MessageReceiveEntity } from './entities';
import { UserSubscriber } from './subscribers';
import { DatabaseModule } from '../database/database.module';
import { AuthService } from './services';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from "@nestjs/axios";

import { RbacModule } from '../rbac/rbac.module';
import { UserRbac } from './rbac';
import { LocalAuthGuard, JwtAuthGuard, JwtWsGuard } from './guards';
import { SEND_CAPTCHA_QUEUE, SAVE_MESSAGE_QUEUE } from './constants';
import { CoreModule } from '../core/core.module';

import * as repoMaps from "./repositorys";
// import * as controllerMaps from './controller';
import * as strategiesMap from './strategies';
import * as serviceMaps from './services';
import * as queueMaps from "./queues";
import * as gatewayMaps from "./gateways";
// import * as manageMaps from "./controller/manage";
import { addEntities } from '../database/helpers';
import { MediaModule } from '../media/media.module';
import { ModuleBuilder } from '../core/decorators';
// import { MediaModule } from '../media/media.module';

const services = Object.values(serviceMaps);
const strategies = Object.values(strategiesMap);
// const controllers = Object.values(controllerMaps);
const queues = Object.values(queueMaps);
const repos = Object.values(repoMaps)
const gateways = Object.values(gatewayMaps)
const entities = [AccessTokenEntity, RefreshTokenEntity, UserEntity, CodeEntity, MessageEntity, MessageReceiveEntity];

@ModuleBuilder(async configure => ({
    // controllers: [...controllers, ...Object.values(manageMaps)],
    imports: [
        (await addEntities(configure, entities)),
        DatabaseModule.forRepository([...repos]),
        PassportModule,
        AuthService.registerJwtModule(),
        BullModule.registerQueue({name: SEND_CAPTCHA_QUEUE}),
        BullModule.registerQueue({name: SAVE_MESSAGE_QUEUE}),
        forwardRef(() => RbacModule),
        forwardRef(() => MediaModule),
        CoreModule,
        HttpModule
    ],
    providers: [
        UserSubscriber,
        ...strategies,
        ...services,
        LocalAuthGuard,
        JwtAuthGuard,
        JwtWsGuard,
        ...queues,
        ...gateways,
        UserRbac
    ],
    exports: [...services, ...queues, DatabaseModule.forRepository([...repos])],
}))
export class UserModule {}
