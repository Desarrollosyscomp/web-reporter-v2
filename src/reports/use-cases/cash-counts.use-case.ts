// ==================== IMPORTACIONES ====================
import { UseCaseResponse } from "../../local-responses/classes/use-case-response";
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";

// ==================== CASO DE USO: CashCountsUseCase ====================
export class CashCountsUseCase {
    // -------------------- Constructor / inyección de dependencias --------------------
    public constructor(private readonly reportsService: ReportsService) { }

    // -------------------- Orquestación del caso de uso --------------------
    public async main(date: string, warehouse_id: number): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.cashCounts(date, warehouse_id);
        const status = this.defineStatus(error || false);
        return new UseCaseResponse({
            data,
            error,
            status,
        }).getResponse();
    }

    // -------------------- Estado lógico (1 = éxito / 0 = error) --------------------
    private defineStatus(error: boolean): number {
        return error ? 0 : 1;
    }
}
