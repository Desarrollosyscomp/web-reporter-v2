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
        const summary = this.addValues(data[0]);
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

    private addValues(list: Array<any>): TSummary {

        return list.reduce<TSummary>(
            (acc, item) => {
                const total = Number(item.total || 0);
                const returns = Number(item.valordev || 0);
                acc.subtotal += Number(item.subtot || 0);
                acc.totalSales += total;
                acc.totalProducts += Number(item.prodvendid || 0);
                acc.invoiceQuantity += Number(item.cantfact || 0);
                acc.totalTaxes += Number(item.ivaimp || 0);
                acc.totalCosts += Number(item.costoacum || 0);
                acc.returns += returns;
                acc.salesMinusReturns += total - returns;
                return acc;
            },
            {
                subtotal: 0,
                totalSales: 0,
                totalProducts: 0,
                invoiceQuantity: 0,
                totalTaxes: 0,
                totalCosts: 0,
                returns: 0,
                salesMinusReturns: 0
            }
        );
    }

}