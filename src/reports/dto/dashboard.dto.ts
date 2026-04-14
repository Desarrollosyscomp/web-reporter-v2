import { IsOptional, IsString } from "class-validator";
export class DashboardDto {

    @IsOptional()
    @IsString()
    readonly init_date?: string = DashboardDto.getColombiaDate();

    @IsOptional()
    @IsString()
    readonly end_date?: string = DashboardDto.getColombiaDate();

    private static getColombiaDate(): string {
        const date = new Date();
        const colDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
        return colDate.toISOString().split('T')[0].replace(/-/g, '');
    }
}
