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
        const summary = this.addValues(data[0]);
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

    private addValues(list: Array<any>): TSummary {

        let summary: TSummary = {
            subtotal: 0,
            totalTaxes: 0,
            totalSales: 0
        };

        list.forEach((element: any) => {
            summary.subtotal += element.subtotal;
            summary.totalTaxes += element.valimpuesto;
            summary.totalSales += element.valortotal;
        })
        return summary
    }
}
