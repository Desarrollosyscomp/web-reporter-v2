import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";
import { UseCaseResponse } from "../../local-responses/classes/use-case-response";

type TSummary = {
    subtotal: number;
    totalSales: number;
    totalProducts: number;
    invoiceQuantity: number;
    totalTaxes: number;
    totalCosts: number;
    salesMinusReturns: number;
    returns: number;
    profit: number;
}

type TCumilativeSalesRawData = {
    list: any[];
    count: number;
    summary: TSummary;
};

export class CumulativeSalesUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(init_date: string, end_date: string, page: number, limit: number, warehouse_id: number): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.getCumulativeSales(init_date, end_date, page, limit, warehouse_id);
        
        const list = Array.isArray(data[0]) ? data[0] : [];
        const summary = this.parseResponse(data[2], list);
        const status = this.defineStatus(error || false);
        
        return new UseCaseResponse<TCumilativeSalesRawData>({
            data: {
                list: list,
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

    private parseResponse(summary: any, list: any[]): TSummary {
        let _summary: TSummary = {
            subtotal: summary.subtotal,
            totalSales: Number(summary.totalSales || 0),
            totalProducts: Number(summary.totalProducts || 0),
            invoiceQuantity: Number(summary.invoiceQuantity || 0),
            totalTaxes: Number(summary.totalTaxes || 0),
            totalCosts: Number(summary.totalCosts || 0),
            salesMinusReturns: Number(summary.salesMinusReturns || 0),
            returns: Number(summary.returns || 0),
            profit: Number(summary.salesMinusReturns || 0) - Number(summary.totalCosts || 0)
        }
        return _summary;
    }

}