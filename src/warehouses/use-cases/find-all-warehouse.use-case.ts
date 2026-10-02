// ==================== IMPORTACIONES ====================
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { WarehousesService } from "../warehouses.service";
import { UseCaseResponse } from "../../local-responses/classes/use-case-response";


// ==================== CASO DE USO: GetWarehousesUseCase ====================
export class GetWarehousesUseCase {

    // -------------------- Constructor / inyección de dependencias --------------------
    public constructor(private readonly warehouseService: WarehousesService) { }

    // -------------------- Orquestación del caso de uso --------------------
    public async main(): Promise<TUseCaseResponse> {
        const { data, error } = await this.warehouseService.findAll();
        const status = this.defineStatus(error || false);
        return new UseCaseResponse({
            data,
            error,
            status,
        }).getResponse();
    }
    // -------------------- Estado lógico (1 = éxito / 0 = error) --------------------
    private defineStatus(error: boolean | undefined): number {
        return error ? 0 : 1;
    }

}