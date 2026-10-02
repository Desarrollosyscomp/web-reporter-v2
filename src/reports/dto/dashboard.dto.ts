// ==================== IMPORTACIONES ====================
import { IsOptional, IsString } from "class-validator";
import { getColombiaDateString } from "../../common/date-utils";
// ==================== DTO: DashboardDto ====================
export class DashboardDto {

    @IsOptional()
    @IsString()
    readonly init_date?: string = getColombiaDateString();

    @IsOptional()
    @IsString()
    readonly end_date?: string = getColombiaDateString();
}
