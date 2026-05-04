import { UseCaseResponse } from "../../local-responses/classes/use-case-response";
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";

type TSalesDaySummary = {
    totalSales: number;
    totalProducts: number;
    totalInvoices: number;
    totalCost: number;
    totalProfit: number;
    totalReturns: number;
    discounts: number;
    warehouses: Array<{
        fecha: string;
        idalmacen: number;
        nomalmacen: string;
        total: number;
        cantfact: number;
        subtotal: number;
        ivaimp: number;
        costoacum: number;
        valordev: number;
        prodvendid: number;
        totalNeto: number;
        discounts: number;
    }>;
}
export class SalesDayUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(init_date: string): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.salesDay(init_date);

        const transformedData = this.parseResponse(data.sales || []);
        const status = this.defineStatus(error || false);
        return new UseCaseResponse({
            data: { sales: transformedData.warehouses, summary: transformedData },
            error,
            status
        }).getResponse();
    }

    private defineStatus(error: boolean): number {
        return error ? 0 : 1;
    }

    private parseResponse(data: Array<any>): TSalesDaySummary {
        if (!data || !Array.isArray(data)) {
            return {
                totalSales: 0,
                totalProducts: 0,
                totalInvoices: 0,
                totalCost: 0,
                totalProfit: 0,
                totalReturns: 0,
                discounts: 0,
                warehouses: []
            };
        }
        
        const warehouses = data.map(element => ({
            fecha: element.fecha,
            idalmacen: element.idalmacen,
            nomalmacen: element.nomalmacen.trim(),
            total: element.total + (element.sumdesc || 0),
            cantfact: element.cantfact,
            subtotal: element.subtot,
            ivaimp: element.ivaimp,
            costoacum: element.costoacum,
            valordev: element.valordev || 0,
            prodvendid: element.prodvendid,
            totalNeto: (element.total + (element.sumdesc || 0)) - (element.valordev || 0),
            discounts: element.sumdesc || 0
        }));

        const summary = data.reduce((acc, element) => {
            const valordev = element.valordev || 0;
            const descuentos = element.sumdesc || 0;
            const totalNeto = element.total - valordev;
            const totalSinDescuentos = totalNeto + descuentos;
            
            acc.totalSales += totalSinDescuentos;
            acc.totalProducts += element.prodvendid;
            acc.totalInvoices += element.cantfact;
            acc.totalCost += element.costoacum;
            acc.totalReturns += valordev;
            acc.discounts += descuentos;
            return acc;
        }, {
            totalSales: 0,
            totalProducts: 0,
            totalInvoices: 0,
            totalCost: 0,
            totalProfit: 0,
            totalReturns: 0,
            discounts: 0
        });
        
        // Calcular profit correctamente: totalSales - totalCost
        summary.totalProfit = summary.totalSales - summary.totalCost;

        return {
            ...summary,
            warehouses
        };
    }

}