import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    // 注入到class-validator中的容器
    useContainer(app.select(AppModule), {
        fallbackOnErrors: true,
    });
    // app.setGlobalPrefix('api');
    app.enableCors();
    await app.listen(3000);
}
bootstrap();
