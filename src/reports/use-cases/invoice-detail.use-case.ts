import { UseCaseResponse } from "../../local-responses/classes/use-case-response";
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { ReportsService } from "../reports.service";

export class InvoiceDetailUseCase {
 public constructor(private readonly reportsService: ReportsService) { }    

 public async main(warehouse_id: number, invoice_number: number): Promise<TUseCaseResponse> {
    const { data, error } = await this.reportsService.invoiceDetailByWarehouseAndNumber(warehouse_id, invoice_number);
    const status = this.defineStatus(error || false);
    return new UseCaseResponse({
        data,
        error,
        status
    }).getResponse();
 }

 private defineStatus(error: boolean): number {
    return error ? 0 : 1;
}
}