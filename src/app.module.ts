import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WarehousesModule } from './warehouses/warehouses.module';
import { ReportsModule } from './reports/reports.module';
import { LoginModule } from './login/login.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), WarehousesModule, ReportsModule, LoginModule,],
})
export class AppModule { }
