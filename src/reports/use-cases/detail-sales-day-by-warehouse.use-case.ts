import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";
import { UseCaseResponse } from "../../local-responses/classes/use-case-response";


type TSummary = {
    subtotal: number;
    totalTaxes: number;
    totalSales: number;
    discounts: number;
    paymentMethods: Array<TPaymentMethod>;
}

type TDetailSalesRawData = {
    list: any[];
    count: number;
    summary: TSummary;
};

type TPaymentMethod = {
    payment_id: number;
    payment_name: string;
    payment_total: number;
}

export class DetailSalesDayByWarehouseUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(date: string, warehouse_id: number, page: number, limit: number): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.detailSalesDayByWarehouse(date, warehouse_id, page, limit);
        const summary = this.addValues(data[2]);
        const transformedList = this.transformList(data[0]);
        const status = this.defineStatus(error || false);
        return new UseCaseResponse<TDetailSalesRawData>({
            data: {
                list: transformedList,
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

    private transformList(list: any[]): any[] {
        if (!list || !Array.isArray(list)) {
            return [];
        }

        return list.map(item => ({
            ...item,
            valortotal: (item.valortotal || 0) + (item.valdescuentos || 0)
        }));
    }

    private addValues(summary: any): TSummary {
        const discounts = Number(summary.sumdesc || 0);
        let _summary: TSummary = {
            subtotal: summary.subtotal,
            totalTaxes: summary.total_impuestos,
            totalSales: Number(summary.total_ventas || 0) + discounts,
            discounts: discounts,
            paymentMethods: summary.paymentMethods.map((payment: any) => ({
                payment_id: payment.idpago,
                payment_name: payment.nompago,
                payment_total: payment.total
            }))
        };

        return _summary
    }
}
