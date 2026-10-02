// ==================== IMPORTACIONES ====================
import { Module } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';

// ==================== MÓDULO: WarehousesModule ====================
@Module({
  controllers: [WarehousesController],
  providers: [WarehousesService],
})
export class WarehousesModule {}
