import { DynamicModule, Provider, ModuleMetadata} from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AppInterceptor, AppFilter, AppPipe } from '@/modules/core/providers';
import { RedisService, SmsService, SmtpService } from './services';
import { CoreModuleOptions } from "@/modules/utils"
import { createRedisOptions, createQueueOptions } from '../utils/options';
import { isNil, omit} from 'lodash';
import { BullModule } from '@nestjs/bullmq';

export class CoreModule {
    public static forRoot(options: CoreModuleOptions): DynamicModule {
        // 全局管道、拦截器、filter
        const providers: Provider[] = [
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
                        // forbidUnknownValues: true,
                        validationError: { target: false },
                    });
                    return pipe;
                },
            },
        ]   

        const exports: ModuleMetadata['exports'] = []

        let imports: ModuleMetadata['imports'] = [];

        if (options.redis) {
            const optionsArray = createRedisOptions(options.redis);
            if (!isNil(optionsArray)) {
                providers.push({
                    provide: RedisService,
                    useFactory() {
                        const service = new RedisService(optionsArray);
                        // 创建redis客户端
                        service.createClients();
                        // 注入service
                        return service;
                    }
                });
                exports.push(RedisService);

                // 在有redis配置的情况下，创建mq
                if (options.queue) {
                    // 根据redis属性，放入对应的redis配置项
                    const queue = createQueueOptions(options.queue, optionsArray);
                    if (!isNil(queue)) {
                        if (Array.isArray(queue)) {
                            imports = queue.map((v) => 
                                BullModule.forRoot(v.name, omit(v, ['name']))
                            )
                        } else {
                            imports.push(BullModule.forRoot(queue));
                        }
                    }
                }
            }
        }

        // 腾讯云sdk
        if (options.sms) {
            const smsService: Provider = {
                provide: SmsService,
                useFactory() {
                    const service = new SmsService(options.sms);
                    return service;
                }
            }
            providers.push(smsService);
            exports.push(SmsService);
        }

        // nodemailer配置
        if (options.smtp) {
            const smtpService: Provider = {
                provide: SmtpService,
                useFactory() {
                    const service = new SmtpService(options.smtp);
                    return service;
                }
            }
            providers.push(smtpService)
            exports.push(SmtpService);
        }


        return {
            global: true,
            module: CoreModule,
            providers,
            exports,
            imports
        };
    }
}
