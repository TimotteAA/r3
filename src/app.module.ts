import { Module } from '@nestjs/common';
import { ContentModule } from './modules/content/content.module';
import { CoreModule } from '@/modules/core/core.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { configFn } from '@/modules/configs';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ContentModule,
        UserModule,
        CoreModule.forRoot({}),
        DatabaseModule.forRoot(configFn),
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
    ],
    providers: [
       
    ],
})
export class AppModule {}
