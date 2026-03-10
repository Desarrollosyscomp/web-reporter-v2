import { UseCaseResponse } from "../../local-responses/classes/use-case-response";
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";

type TSummary = {
    subtotal: number;
    valueAddedTax: number;
    totalDiscounts: number;
    totalSale: number;
    customer: string;
    profit: number;
    totalItems: number
}

type TInvoiceDetails = {
    invoice: any[];
    summary: TSummary;
}

export class InvoiceDetailUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(warehouse_id: number, invoice_number: number): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.invoiceDetailByWarehouseAndNumber(warehouse_id, invoice_number);
        const summary = this.getSummary(data.invoice);
        const status = this.defineStatus(error || false);
        return new UseCaseResponse<TInvoiceDetails>({
            data: {
                invoice: data.invoice,
                summary
            },
            error,
            status
        }).getResponse();
    }

    private defineStatus(error: boolean): number {
        return error ? 0 : 1;
    }

    private getSummary(list: Array<any>): TSummary {

        return list.reduce<TSummary>((acc, item) => {
            const _subtotal = Number(item.subtotal || 0);
            let _cost = Number(0);
            _cost += item.total_cost;
            acc.subtotal = item.subtotal;
            acc.totalSale = item.valortotal;
            acc.valueAddedTax = item.valimpuesto;
            acc.totalDiscounts = item.valdescuentos;
            acc.customer = `${item.nombres} ${item.apellidos}`;
            acc.totalItems += item.cantidad;
            acc.profit = _subtotal - _cost;
            return acc;

        }, {
            subtotal: 0,
            valueAddedTax: 0,
            totalDiscounts: 0,
            totalSale: 0,
            customer: '',
            profit: 0,
            totalItems: 0
        });
    }

}