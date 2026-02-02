import { MySQLAdapter } from "../../database/mysql/mysql.adapter";
import { ReportsService } from "../reports.service";
import { CumulativeSalesUseCase } from "../use-cases/cumulative-sales.use-case";
import { DetailSalesDayByWarehouseUseCase } from "../use-cases/detail-sales-day-by-warehouse.use-case";
import { InvoiceDetailUseCase } from "../use-cases/invoice-detail.use-case";
import { SalesDayUseCase } from "../use-cases/sales-day.use-case";

export const salesDayUseCaseCompositor = (): SalesDayUseCase => {
    const db = new MySQLAdapter();
    const service = new ReportsService(db);
    return new SalesDayUseCase(service);
}

export const detailSalesDayByWarehouseUseCaseCompositor = (): DetailSalesDayByWarehouseUseCase => {
    const db = new MySQLAdapter();
    const service = new ReportsService(db);
    return new DetailSalesDayByWarehouseUseCase(service);
}

export const invoiceDetailUseCaseCompositor = (): InvoiceDetailUseCase => {
    const db = new MySQLAdapter();
    const service = new ReportsService(db);
    return new InvoiceDetailUseCase(service);
}

export const cumulativeSalesUseCaseCompositor = (): CumulativeSalesUseCase => {
    const db = new MySQLAdapter();
    const service = new ReportsService(db);
    return new CumulativeSalesUseCase(service);
}