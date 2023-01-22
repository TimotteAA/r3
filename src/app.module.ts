import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ContentModule } from './modules/content/content.module';
import { CoreModule } from '@/modules/core/core.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { configFn } from './modules/database/config/database.config';
import { AppInterceptor, AppFilter, AppPipe } from '@/modules/core/providers';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [ContentModule, UserModule, CoreModule.forRoot(), DatabaseModule.forRoot(configFn)],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: AppInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: AppFilter,
        },
        {
            provide: APP_PIPE,
            useFactory() {
                const pipe = new AppPipe({
                    transform: true,
                    forbidUnknownValues: true,
                    validationError: { target: false },
                });
                return pipe;
            },
        },
    ],
})
export class AppModule {}