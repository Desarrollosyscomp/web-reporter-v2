import { UseCaseResponse } from "../../local-responses/classes/use-case-response";
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";

type TSummary = {
    warehouseName: string;
    inventoryStock: number;
    averageInventoryCost: number;
    inventoryCost: number;
    inventoryPrice: number;
    profit: number;
    totalPurchasesIva: number;
    totalSalesIva: number;
}

type TDetailInventory = {
    list: any[];
    count: number;
    summary: TSummary;
};

export class InventoryUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(warehouse_id: number, limit: number,
        page: number, search?: string): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.inventory(warehouse_id, limit, page, search);
        const summary = this.parseSummary(data[2], warehouse_id);
        const status = this.defineStatus(error || false);
        return new UseCaseResponse<TDetailInventory>({
            data: {
                list: data[0],
                count: data[1],
                summary,
            },
            error,
            status,
            limit
        }).getResponse();
    }
    private defineStatus(error: boolean): number {
        return error ? 0 : 1;
    }

    private parseSummary(summary: any, warehouse_id: number): TSummary {

        return {
            warehouseName: warehouse_id === 0
                ? 'TODOS LOS ALMACENES'
                : summary.nomalmacen,
            inventoryStock: Number(summary.inventoryStock || 0),
            averageInventoryCost: Number(summary.averageInventoryCost || 0),
            inventoryCost: Number(summary.inventoryCost || 0),
            inventoryPrice: Number(summary.inventoryPrice || 0),
            profit: Number(summary.profit || 0),
            totalPurchasesIva: Number(summary.ivaTotalCompras || 0),
            totalSalesIva: Number(summary.ivaTotalVentas || 0)
        };
    }
}