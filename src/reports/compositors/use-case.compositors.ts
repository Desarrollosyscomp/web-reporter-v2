import { MySQLAdapter } from "../../database/mysql/mysql.adapter";
import { ReportsService } from "../reports.service";
import { CashCountsUseCase } from "../use-cases/cash-counts.use-case";
import { CumulativeSalesUseCase } from "../use-cases/cumulative-sales.use-case";
import { DetailSalesDayByWarehouseUseCase } from "../use-cases/detail-sales-day-by-warehouse.use-case";
import { InventoryUseCase } from "../use-cases/inventory.use-case";
import { InvoiceDetailUseCase } from "../use-cases/invoice-detail.use-case";
import { PayablePortfolioUseCase } from "../use-cases/payable-portfolio.use-case";
import { ReceivablePortfolioUseCase } from "../use-cases/receivable-portfolio.use-case";
import { SalesDayUseCase } from "../use-cases/sales-day.use-case";


export const salesDayUseCaseCompositor = (req: Request): SalesDayUseCase => {
    return new SalesDayUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );
};

export const detailSalesDayByWarehouseUseCaseCompositor = (req: Request): DetailSalesDayByWarehouseUseCase =>
    new DetailSalesDayByWarehouseUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );

export const invoiceDetailUseCaseCompositor = (req: Request): InvoiceDetailUseCase =>
    new InvoiceDetailUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );

export const cumulativeSalesUseCaseCompositor = (req: Request): CumulativeSalesUseCase =>
    new CumulativeSalesUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );

export const cashCountsUseCaseCompositor = (req: Request): CashCountsUseCase =>
    new CashCountsUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );

export const receivablePortfolioUseCaseCompositor = (req: Request): ReceivablePortfolioUseCase =>
    new ReceivablePortfolioUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );

export const payablePortfolioUseCaseCompositor = (req: Request): PayablePortfolioUseCase =>
    new PayablePortfolioUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );

export const inventoryUseCaseCompositor = (req: Request): InventoryUseCase =>
    new InventoryUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );
