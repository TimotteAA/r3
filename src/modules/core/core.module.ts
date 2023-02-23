import { DynamicModule, Provider, ModuleMetadata} from '@nestjs/common';
import { CoreModuleOptions } from "@/modules/utils"

// import { RestfulModule } from '../restful/restful.module';
// import chalk from 'chalk';

export class CoreModule {
    public static forRoot(options: CoreModuleOptions): DynamicModule {
        // 全局管道、拦截器、filter
        const providers: Provider[] = []   

        const exports: ModuleMetadata['exports'] = []

        let imports: ModuleMetadata['imports'] = [];
        return {
            global: true,
            module: CoreModule,
            providers,
            exports,
            imports
        };
    }
}
