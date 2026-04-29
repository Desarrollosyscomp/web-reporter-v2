import { UseCaseResponse } from "../../local-responses/classes/use-case-response";
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";

type TSummary = {
    totalSales: number;
    totalProducts: number;
    totalInvoices: number;
    totalCost: number;
    totalProfit: number;
    totalReturns: number;
    warehouses: Array<{
        idalmacen: number;
        nomalmacen: string;
        total: number;
        cantfact: number;
        subtotal: number;
        ivaimp: number;
        costoacum: number;
        valordev: number;
        totalNeto: number;
    }>;
}
export class SalesDayUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(init_date: string): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.salesDay(init_date);

        const summary = this.parseResponse(data.sales || []);
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
        if (!data || !Array.isArray(data)) {
            return {
                totalSales: 0,
                totalProducts: 0,
                totalInvoices: 0,
                totalCost: 0,
                totalProfit: 0,
                totalReturns: 0,
                warehouses: []
            };
        }
        
        const warehouses = data.map(element => ({
            idalmacen: element.idalmacen,
            nomalmacen: element.nomalmacen.trim(),
            total: element.total,
            cantfact: element.cantfact,
            subtotal: element.subtotal,
            ivaimp: element.ivaimp,
            costoacum: element.costoacum,
            valordev: element.valordev || 0,
            totalNeto: element.total - (element.valordev || 0)
        }));

        const summary = data.reduce((acc, element) => {
            const valordev = element.valordev || 0;
            const totalNeto = element.total - valordev;
            const subtotalNeto = element.subtot - valordev;
            
            acc.totalSales += totalNeto;
            acc.totalProducts += element.prodvendid;
            acc.totalInvoices += element.cantfact;
            acc.totalCost += element.costoacum;
            acc.totalProfit += subtotalNeto - element.costoacum;
            acc.totalReturns += valordev;
            return acc;
        }, {
            totalSales: 0,
            totalProducts: 0,
            totalInvoices: 0,
            totalCost: 0,
            totalProfit: 0,
            totalReturns: 0
        });

        return {
            ...summary,
            warehouses
        };
    }

}