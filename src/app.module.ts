import { Module } from '@nestjs/common';
import { ContentModule } from './modules/content/content.module';
import { CoreModule } from '@/modules/core/core.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { ElasticSearchModule } from './modules/elastic/elastic-search.module';
import { configFn, smsConfigFn, smtpConfigFn, redisConfigFn, queueConfigFn, elasticConfigFn } from '@/modules/configs';
import { UserModule } from './modules/user/user.module';
import { RbacModule } from './modules/rbac/rbac.module';
@Module({
    imports: [
        ContentModule.forRoot(() => ({searchType: "elastic"})),
        UserModule,
        CoreModule.forRoot({
            sms: smsConfigFn(),
            smtp: smtpConfigFn(),
            redis: redisConfigFn(),
            queue: queueConfigFn()
        }),
        DatabaseModule.forRoot(configFn),
        // ConfigModule.forRoot({
        //     envFilePath: '.env',
        //     isGlobal: true,
        // }),
        ElasticSearchModule.forRoot(elasticConfigFn()),
        RbacModule
    ],
    providers: [
       
    ],
})
export class AppModule {}
