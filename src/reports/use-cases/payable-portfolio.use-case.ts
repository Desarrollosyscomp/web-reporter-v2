import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";
import { UseCaseResponse } from "../../local-responses/classes/use-case-response";

type TPayablePortfolioRawData = {
    list: any[];
    count: number;
    summary: TSummary;
};

type TSummary = {
    pendingPaid: number;
    totalPayed: number;
}

export class PayablePortfolioUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(init_date: string, end_date: string,
        page: number, limit: number, warehouse_id: number): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.payablePortfolio(init_date, end_date, page, limit, warehouse_id);
        const summary = this.parseSummary(data[2]);
        const status = this.defineStatus(error || false);
        return new UseCaseResponse<TPayablePortfolioRawData>({
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

    private defineStatus(error: boolean): number {
        return error ? 0 : 1;
    }
    private parseSummary(summary:any): TSummary {
        return {
            pendingPaid: summary.pendingPaid,
            totalPayed: summary.totalPayed
        }
    }
}