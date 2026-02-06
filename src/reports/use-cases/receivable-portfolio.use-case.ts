import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";
import { UseCaseResponse } from "../../local-responses/classes/use-case-response";

type TReceivablePortfolioRawData = {
    list: any[];
    count: number;
    summary: TSummary;
};

type TSummary = {
    pendingPaid: number;
    totalPayed: number;
}

export class ReceivablePortfolioUseCase {
    public constructor(private readonly reportService: ReportsService) { }

    public async main(init_date: string, end_date: string, page: number,
        limit: number, warehouse_id: number): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportService.receivablePortfolio(init_date, end_date, page, limit, warehouse_id);
        const summary = this.addValues(data[0]);
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

    private defineStatus(error: boolean): number {
        return error ? 0 : 1;
    }

    private addValues(list: Array<any>): TSummary {

        return list.reduce<TSummary>((acc, item) => {
            acc.pendingPaid += Number(item.saldo_pendiente);
            acc.totalPayed += Number(item.total_pagado);
            return acc;
        }, {
            pendingPaid: 0,
            totalPayed: 0
        });
    }
}
