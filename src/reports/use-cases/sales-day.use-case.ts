import { UseCaseResponse } from "../../local-responses/classes/use-case-response";
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";

type TSummary = {
    totalSales: number;
    totalProducts: number;
    totalInvoices: number;
    totalCost: number;
    totalProfit: number;
}
export class SalesDayUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(init_date: string): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.salesDay(init_date);

        const summary = this.parseResponse(data.sales);
        const status = this.defineStatus(error || false);
        return new UseCaseResponse({
            data: { sales: data.sales, summary },
            error,
            status
        }).getResponse();
    }

    private defineStatus(error: boolean): number {
        return error ? 0 : 1;
    }

    private parseResponse(data: Array<any>): TSummary {

        return data.reduce<TSummary>((acc, element) => {
            acc.totalSales += element.total;
            acc.totalProducts += element.prodvendid;
            acc.totalInvoices += element.cantfact;
            acc.totalCost += element.costoacum;
            acc.totalProfit += element.subtot - element.costoacum;
            return acc;
        }, {
            totalSales: 0,
            totalProducts: 0,
            totalInvoices: 0,
            totalCost: 0,
            totalProfit: 0
        });


    }

}