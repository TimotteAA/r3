import { Module } from '@nestjs/common';
import { UserController } from './controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenEntity, RefreshTokenEntity, UserEntity } from './entities';
import { UserSubscriber } from './subscribers';
import { DatabaseModule } from '../database/database.module';
import { UserRepository } from './repositorys';

@Module({
    controllers: [UserController],
    imports: [
        TypeOrmModule.forFeature([AccessTokenEntity, RefreshTokenEntity, UserEntity]),
        DatabaseModule.forRepository([UserRepository]),
    ],
    providers: [UserSubscriber],
    exports: [],
})
export class UserModule {}
