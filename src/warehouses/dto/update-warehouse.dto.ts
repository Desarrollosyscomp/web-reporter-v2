// ==================== IMPORTACIONES ====================
import { PartialType } from '@nestjs/swagger';
import { CreateWarehouseDto } from './create-warehouse.dto';

// ==================== DTO: UpdateWarehouseDto ====================
export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
