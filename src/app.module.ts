import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WarehousesModule } from './warehouses/warehouses.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), WarehousesModule,],
})
export class AppModule { }
