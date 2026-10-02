// ==================== IMPORTACIONES ====================
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";
import { UseCaseResponse } from "../../local-responses/classes/use-case-response";

// ==================== TIPOS ====================
type TReceivablePortfolioRawData = {
    list: any[];
    count: number;
    summary: TSummary;
};

type TSummary = {
    pendingPaid: number;
    totalPayed: number;
}

// ==================== CASO DE USO: ReceivablePortfolioUseCase ====================
export class ReceivablePortfolioUseCase {
    // -------------------- Constructor / inyección de dependencias --------------------
    public constructor(private readonly reportService: ReportsService) { }

    // -------------------- Orquestación del caso de uso --------------------
    public async main(init_date: string, end_date: string, page: number,
        limit: number, warehouse_id: number): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportService.receivablePortfolio(init_date, end_date, page, limit, warehouse_id);
        const summary = this.parseSummary(data[2]);
        const status = this.defineStatus(error || false);
        return new UseCaseResponse<TReceivablePortfolioRawData>({
            data: {
                list: data[0],
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

    // -------------------- Transformación del resumen --------------------
    private parseSummary(summary: any): TSummary {

        return {
            pendingPaid: summary.pendingPaid,
            totalPayed: summary.totalPayed
        };
    }
}
