// ==================== IMPORTACIONES ====================
import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

// ==================== DTO: PaginateReportDto ====================
export class PaginateReportDto {
    @IsNumber()
    @Type(() => Number)
    readonly limit: number;

    @IsNumber()
    @Type(() => Number)
    readonly page: number;

}
