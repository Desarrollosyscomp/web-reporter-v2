import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class PaginateInventoryDto {
    @IsNumber()
    @Type(() => Number)
    readonly warehouse_id: number;

    @IsNumber()
    @Type(() => Number)
    readonly limit: number;

    @IsNumber()
    @Type(() => Number)
    readonly page: number;

    @IsString()
    @Type(() => String)
    @IsOptional()
    readonly search?: string;
}