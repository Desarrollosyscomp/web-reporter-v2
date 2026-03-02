import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './commons/logging.interceptor';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
export let globalCache: Cache;
const sortPathsAlphabetically = (document: any) => {
  const sortedPaths = Object.keys(document.paths)
    .sort()
    .reduce((acc, key) => {
      acc[key] = document.paths[key];
      return acc;
    }, {});

  document.paths = sortedPaths;
  return document;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalInterceptors(new LoggingInterceptor());
  globalCache = app.get<Cache>(CACHE_MANAGER);
  const server = app.getHttpServer();
  server.setTimeout?.(120000);

  const config = new DocumentBuilder()
    .setTitle('Web Reports API')
    .setDescription('API del sistema reportes web')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  let document = SwaggerModule.createDocument(app, config);
  document = sortPathsAlphabetically(document);
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: 1,
      docExpansion: 'none',
      operationsSorter: 'alpha',
      filter: true,
      showRequestDuration: true,
      persistAuthorization: true,
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const logger = new Logger('Main');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 3200);
  await app.listen(process.env.API_PORT || 3200);
  logger.log('server is listening on port:' + port)
}
bootstrap();
