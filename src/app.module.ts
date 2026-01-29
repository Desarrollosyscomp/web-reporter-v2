import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WarehousesModule } from './warehouses/warehouses.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), WarehousesModule, ReportsModule,],
})
export class AppModule { }
