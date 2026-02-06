import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './commons/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalInterceptors(new LoggingInterceptor());
  const server = app.getHttpServer();
  server.setTimeout?.(120000);

  const config = new DocumentBuilder()
    .setTitle('Web Reports API')
    .setDescription('API del sistema reportes web')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const logger = new Logger('Main');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3200);
  await app.listen(process.env.PORT || 3200);
  logger.log('server is listening on port:' + port)
}
bootstrap();
