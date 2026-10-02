// ==================== IMPORTACIONES ====================
import { Module } from '@nestjs/common';
import { TenantDatabaseService } from './tenant-database.service';

// ==================== MÓDULO: AdminModule ====================
@Module({
  providers: [TenantDatabaseService],
  exports: [TenantDatabaseService],
})
export class AdminModule {}
