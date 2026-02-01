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

        const { summary } = this.addValues(data.sales);
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

    private addValues(data: Array<any>): { summary: TSummary } {
        
        let summary: TSummary = {
            totalSales: 0,
            totalProducts: 0,
            totalInvoices: 0,
            totalCost: 0,
            totalProfit: 0
        }

        data.forEach((element: any) => {
            summary.totalSales += element.total;
            summary.totalProducts += element.prodvendid;
            summary.totalInvoices += element.cantfact;
            summary.totalCost += element.costoacum;
            summary.totalProfit += element.subtot - element.costoacum;
        });
        return { summary };
    }

}