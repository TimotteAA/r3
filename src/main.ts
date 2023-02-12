import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    // 注入到class-validator中的容器
    useContainer(app.select(AppModule), {
        fallbackOnErrors: true,
    });
    app.enableCors();
    app.useWebSocketAdapter(new WsAdapter(app))
    // 注册fastify multipart插件
    // eslint-disable-next-line global-require
    app.register(require('@fastify/multipart'), {
        attachFieldsToBody: true,
    });
    await app.listen(3000, '0.0.0.0');
}
bootstrap();
