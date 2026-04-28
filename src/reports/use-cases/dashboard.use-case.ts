import { UseCaseResponse } from "../../local-responses/classes/use-case-response";
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";

export type TRange = {
    summary_range: {
        init: string;
        end: string;
    };

    weekly_range: {
        from: string;
        to: string;
    };
};

type TSalesDay = {
    totalSales: number;
    warehouses: Array<{
        idalmacen: number;
        nomalmacen: string;
        total: number;
        cantfact: number;
        subtotal: number;
        ivaimp: number;
        costoacum: number;
    }>;
}
type TDashboardData = {
    salesDay: TSalesDay;
    payablePortfolio: TPayaablePortfolio;
    receivablePortfolio: TReceivablePortfolio;
}

type TPayaablePortfolio = {
    totalPayed: number;
    pendingPaid: number;
}
type TReceivablePortfolio = {
    totalPayed: number;
    pendingPaid: number;
}

type TCumulativeSales = {
    date: string;
    idalmacen: number;
    totalSales: number;
    totalProducts: number;
    invoiceQuantity: number;
    totalCosts: number;
    returns: number;
    salesMinusReturns: number;
}

export class DashboardUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(init_date?: string, end_date?: string): Promise<TUseCaseResponse> {
        const range = this.parseDate(init_date || '', end_date || '');
        const { data, error } = await this.reportsService.dashboard(range);
        const status = this.defineStatus(error || false);
        const totalSalesDay = this.totalSales(data.salesDay);
        const payablePortfolio = this.payablePortfolio(data.payablePortfolio);
        const receivablePortfolio = this.receivablePortfolio(data.receivablePortfolio);
        const cumulativeSales = this.parseCumulativeSales(data.cumulativeSales);
        return new UseCaseResponse<TDashboardData>({
            data: {
                salesDay: totalSalesDay,
                payablePortfolio,
                receivablePortfolio,
                cumulativeSales
            },
            error,
            status,
        }).getResponse();
    }

    private defineStatus(error: boolean): number {
        return error ? 0 : 1;
    }
    private parseDate(init_date: string, end_date: string): TRange {

        const today = new Date();
        const init = init_date;
        const end = end_date;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        const startDateSevenDays = this.formatToYYYYMMDD(sevenDaysAgo);
        const endDateSevenDays = this.formatToYYYYMMDD(today);

        return {
            summary_range: {
                init,
                end
            },
            weekly_range: {
                from: startDateSevenDays,
                to: endDateSevenDays
            }
        };
    }
    private formatToYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    private totalSales(data: any[]): TSalesDay {
        const warehouses = data.map(item => ({
            idalmacen: item.idalmacen,
            nomalmacen: item.nomalmacen.trim(),
            total: item.total,
            cantfact: item.cantfact,
            subtotal: item.subtotal,
            ivaimp: item.ivaimp,
            costoacum: item.costoacum
        }));
        
        const totalSales = data.reduce((acc, item) => acc + item.total, 0);
        
        return {
            totalSales,
            warehouses
        };
    }

    private payablePortfolio(data: any[]): TPayaablePortfolio {
        return data.reduce<TPayaablePortfolio>((acc, item) => {
            acc.totalPayed = item.totalPayed;
            acc.pendingPaid = item.pendingPaid;
            return acc;
        }, { totalPayed: 0, pendingPaid: 0 })
    }

    private receivablePortfolio(data: any[]): TReceivablePortfolio {
        return data.reduce<TReceivablePortfolio>((acc, item) => {
            acc.totalPayed = item.totalPayed;
            acc.pendingPaid = item.pendingPaid;
            return acc;
        }, { totalPayed: 0, pendingPaid: 0 })
    }

    private parseCumulativeSales(data: Array<any>): TCumulativeSales[] {
        return data.reduce<TCumulativeSales[]>((acc, item) => {
            acc.push({
                date: item.fecha,
                idalmacen: item.idalmacen,
                totalSales: Number(item.totalSales || 0),
                totalProducts: Number(item.totalProducts || 0),
                invoiceQuantity: Number(item.invoiceQuantity || 0),
                totalCosts: Number(item.totalCosts || 0),
                returns: Number(item.returns || 0),
                salesMinusReturns: Number(item.salesMinusReturns || 0)
            });
            return acc;
        }, [] as TCumulativeSales[])
    }
}
