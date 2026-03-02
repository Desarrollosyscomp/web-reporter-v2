import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WarehousesModule } from './warehouses/warehouses.module';
import { ReportsModule } from './reports/reports.module';
import { LoginModule } from './login/login.module';
import { AdminModule } from './admin/admin.module';
import { ValidationMiddleware } from './middlewares/validation.middleware';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600 * 1000,
      max: 500,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          algorithm: configService.get<string>('JWT_ALGORITHMS') as any,
        },
      }),
      inject: [ConfigService],
    }),
    AdminModule,
    WarehousesModule,
    ReportsModule,
    LoginModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidationMiddleware)
      .exclude(
        {
          path: 'login/auth',
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*');
  }
}
