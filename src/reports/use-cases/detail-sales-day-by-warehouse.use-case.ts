import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";
import { UseCaseResponse } from "../../local-responses/classes/use-case-response";


type TSummary = {
    subtotal: number;
    totalTaxes: number;
    totalSales: number;
}

type TDetailSalesRawData = {
    list: any[];
    count: number;
    summary: TSummary;
};

export class DetailSalesDayByWarehouseUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(date: string, warehouse_id: number, page: number, limit: number): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.detailSalesDayByWarehouse(date, warehouse_id, page, limit);
        const summary = this.addValues(data[2]);
        const status = this.defineStatus(error || false);
        return new UseCaseResponse<TDetailSalesRawData>({
            data: {
                list: data[0],
                count: data[1],
                summary,
            },
            error,
            status,
            limit,
        }).getResponse();
    }
    private defineStatus(error: boolean): number {
        return error ? 0 : 1;
    }

    private addValues(summary: any): TSummary {

        let _summary: TSummary = {
            subtotal: summary.subtotal,
            totalTaxes: summary.total_impuestos,
            totalSales: summary.total_ventas
        };

        return _summary
    }
}
