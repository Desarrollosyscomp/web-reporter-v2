import { UseCaseResponse } from "../../local-responses/classes/use-case-response";
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";

export class CashCountsUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(date: string, warehouse_id: number): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.cashCounts(date, warehouse_id);
        const status = this.defineStatus(error || false);
        return new UseCaseResponse({
            data,
            error,
            status,
        }).getResponse();
    }

    private defineStatus(error: boolean): number {
        return error ? 0 : 1;
    }
}
