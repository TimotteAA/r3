import { DynamicModule } from '@nestjs/common';

export class CoreModule {
    public static forRoot(): DynamicModule {
        return {
            module: CoreModule,
        };
    }
}
