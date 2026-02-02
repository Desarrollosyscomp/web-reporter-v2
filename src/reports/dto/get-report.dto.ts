import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GetReportDto {

    @IsString()
    @IsNotEmpty()
    readonly init_date: string;

    @IsString()
    @IsNotEmpty()
    readonly end_date: string;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    readonly limit: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    readonly page: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    readonly warehouse_id: number;
}
