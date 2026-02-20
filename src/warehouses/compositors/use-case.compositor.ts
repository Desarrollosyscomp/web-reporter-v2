import { GetWarehousesUseCase } from "../use-cases/find-all-warehouse.use-case";
import { WarehousesService } from "../warehouses.service";
import { MySQLAdapter } from "../../database/mysql/mysql.adapter";

export const findAllWarehousesUseCaseCompositor = (req:any): GetWarehousesUseCase => {
    const db = new MySQLAdapter(req);
    const service = new WarehousesService(db);
    return new GetWarehousesUseCase(service);
};
