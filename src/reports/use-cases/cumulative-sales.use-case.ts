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
        const summary = this.parseResponse(data[2]);
        const status = this.defineStatus(error || false);
        return new UseCaseResponse<TCumilativeSalesRawData>({
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

    private parseResponse(summary: any): TSummary {
        // Calcular utilidad como ventas netas (salesMinusReturns) menos costos totales
        // Nota: Idealmente, los costos de devoluciones deberían restarse de totalCosts
        // pero como no tenemos esa información en la base de datos, usamos este cálculo
        let _profit = summary.salesMinusReturns - summary.totalCosts;
        
        let _summary: TSummary = {
            subtotal: summary.subtotal,
            totalSales: summary.totalSales,
            totalProducts: summary.totalProducts,
            invoiceQuantity: Number(summary.invoiceQuantity || 0),
            totalTaxes: summary.totalTaxes,
            totalCosts: summary.totalCosts,
            salesMinusReturns: summary.salesMinusReturns,
            returns: summary.returns,
            profit: _profit
        }
        return _summary;
    }

}