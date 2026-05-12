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
    totalItems: number;
    paymentMethods: Array<TPaymentMethod>;

}

type TInvoiceDetails = {
    invoice: any[];
    summary: TSummary;
}

type TPaymentMethod = {
    payment_id: number;
    payment_name: string;
    payment_total: number;
}


export class InvoiceDetailUseCase {
    public constructor(private readonly reportsService: ReportsService) { }

    public async main(warehouse_id: number, invoice_number: number): Promise<TUseCaseResponse> {
        const { data, error } = await this.reportsService.invoiceDetailByWarehouseAndNumber(warehouse_id, invoice_number);
        const summary = this.getSummary(data.invoice, data.paymentMethods);
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

    private getSummary(list: Array<any>, paymentMethods: Array<any>): TSummary {
        
        const totalCosto = list.reduce((sum, item) => sum + Number(item.total_costo || 0), 0);
        const firstItem = list[0] || {};
        const calculatedTotal = Number((Number(firstItem.subtotal || 0) + Number(firstItem.valimpuesto || 0) - Number(firstItem.valdescuentos || 0)).toFixed(2));

        return list.reduce<TSummary>((acc, item) => {
            const _subtotal = Number(item.subtotal || 0);
            acc.subtotal = item.subtotal;
            acc.totalSale = calculatedTotal;
            acc.valueAddedTax = item.valimpuesto;
            acc.totalDiscounts = item.valdescuentos;
            acc.customer = `${item.nombres} ${item.apellidos}`;
            acc.totalItems += item.cantidad;
            acc.profit = _subtotal - totalCosto;
            acc.paymentMethods = paymentMethods.map((payment) => ({
                payment_id: payment.idpago,
                payment_name: payment.nompago,
                payment_total: payment.total
            }));
            return acc;

        }, {
            subtotal: 0,
            valueAddedTax: 0,
            totalDiscounts: 0,
            totalSale: 0,
            customer: '',
            profit: 0,
            totalItems: 0,
            paymentMethods: []
        });
    }

}