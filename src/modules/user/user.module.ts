import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import * as controllerMaps from './controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenEntity, RefreshTokenEntity, UserEntity } from './entities';
import { UserSubscriber } from './subscribers';
import { DatabaseModule } from '../database/database.module';
import { UserRepository } from './repositorys';
import { AuthService } from './services';
import * as strategiesMap from './strategies';
import { PassportModule } from '@nestjs/passport';
import * as serviceMaps from './services';
import { LocalAuthGuard, JwtAuthGuard } from './guards';

const services = Object.values(serviceMaps);
const strategies = Object.values(strategiesMap);
const controllers = Object.values(controllerMaps);

@Module({
    controllers: [...controllers],
    imports: [
        TypeOrmModule.forFeature([AccessTokenEntity, RefreshTokenEntity, UserEntity]),
        DatabaseModule.forRepository([UserRepository]),
        PassportModule,
        AuthService.registerJwtModule(),
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
    ],
    exports: [...services],
})
export class UserModule {}
