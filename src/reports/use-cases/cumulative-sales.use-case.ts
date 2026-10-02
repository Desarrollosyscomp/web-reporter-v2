// ==================== IMPORTACIONES ====================
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";
import { UseCaseResponse } from "../../local-responses/classes/use-case-response";

// ==================== TIPOS ====================
type TSummary = {
    subtotal: number;
    totalSales: number;
    totalProducts: number;
    totalInvoices: number;
    totalTaxes: number;
    totalCost: number;
    salesMinusReturns: number;
    totalReturns: number;
    totalProfit: number;
    discounts: number;
}

type TCumilativeSalesRawData = {
    list: any[];
    count: number;
    summary: TSummary;
};

// ==================== CASO DE USO: CumulativeSalesUseCase ====================
export class CumulativeSalesUseCase {
    // -------------------- Constructor / inyección de dependencias --------------------
    public constructor(private readonly reportsService: ReportsService) { }

    // -------------------- Orquestación del caso de uso --------------------
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
    // -------------------- Estado lógico (1 = éxito / 0 = error) --------------------
    private defineStatus(error: boolean): number {
        return error ? 0 : 1;
    }

    // -------------------- Transformación de la respuesta --------------------
    private parseResponse(summary: any, list: any[]): TSummary {
        let totalCost = Number(summary.totalCost || 0);
        let discounts = Number(summary.discounts || 0);
        let totalSales = Number(summary.totalSales || 0) + discounts;
        let totalSalesBruto = Number(summary.totalSales || 0) + discounts; // Total sin descuentos restados
        let totalProducts = Number(summary.totalProducts || 0);

        let _summary: TSummary = {
            subtotal: summary.subtotal,
            totalSales: totalSales,
            totalProducts: totalProducts,
            totalInvoices: Number(summary.invoiceQuantity || 0),
            totalTaxes: Number(summary.totalTaxes || 0),
            totalCost: totalCost,
            salesMinusReturns: totalSalesBruto - Number(summary.returns || 0),
            totalReturns: Number(summary.returns || 0),
            totalProfit: totalSales - totalCost,
            discounts: discounts
        }
        return _summary;
    }

}