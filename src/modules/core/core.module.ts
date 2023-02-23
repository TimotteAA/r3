import { ModuleBuilder } from './decorators';
import { Configure } from './configure';

@ModuleBuilder(async (configure) => ({
    global: true,
    providers: [
        {
            provide: Configure,
            useValue: configure
        }
    ],
    exports: [Configure]
}))
export class CoreModule {}
