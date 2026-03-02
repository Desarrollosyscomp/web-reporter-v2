import { UseCaseResponse } from "../../local-responses/classes/use-case-response";
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";

type TSummary = {
    warehouseName: string;
    inventoryStock: number;
    averageInventoryCost: number;
    inventoryCost: number;
    inventoryPrice: number;
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
        const summary = this.addValues(data[0], warehouse_id);
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

    private addValues(list: Array<any>, warehouse_id: number): TSummary {

        return list.reduce<TSummary>((acc, item) => {
            let warehouse_name: string = '';
            if (warehouse_id === 0) {
                warehouse_name = 'TODOS LOS ALMACENES';
            }
            acc.warehouseName = warehouse_name ? warehouse_name : item.nombre_almacen;
            acc.inventoryStock += Number(item.cantidad || 0);
            acc.averageInventoryCost += Number(item.costo_ponderado || 0);
            acc.inventoryCost += Number(item.costo_total || 0);
            acc.inventoryPrice += Number(item.valorizado || 0);

            return acc;
        }, {
            warehouseName: '',
            inventoryStock: 0,
            averageInventoryCost: 0,
            inventoryCost: 0,
            inventoryPrice: 0
        });
    }
}