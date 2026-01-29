import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { WarehousesService } from "../warehouses.service";
import { UseCaseResponse } from "../../local-responses/classes/use-case-response";


export class GetWarehousesUseCase {

    public constructor(private readonly warehouseService: WarehousesService) { }

    public async main(): Promise<TUseCaseResponse> {
        const { data, error } = await this.warehouseService.findAll();
        const status = this.defineStatus(error || false);
        return new UseCaseResponse({
            data,
            error,
            status,
        }).getResponse();
    }
    private defineStatus(error: boolean | undefined): number {
        return error ? 0 : 1;
    }

}