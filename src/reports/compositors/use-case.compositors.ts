import { MySQLAdapter } from "../../database/mysql/mysql.adapter";
import { ReportsService } from "../reports.service";
import { SalesDayUseCase } from "../use-cases/sales-day.use-case";

export const salesDayUseCaseCompositor = (): SalesDayUseCase => {
    const db = new MySQLAdapter();
    const service = new ReportsService(db);
    return new SalesDayUseCase(service);
}