import { MySQLAdapter } from "../../database/mysql/mysql.adapter";
import { ReportsService } from "../reports.service";
import { CashCountsUseCase } from "../use-cases/cash-counts.use-case";
import { CumulativeSalesUseCase } from "../use-cases/cumulative-sales.use-case";
import { DetailSalesDayByWarehouseUseCase } from "../use-cases/detail-sales-day-by-warehouse.use-case";
import { InvoiceDetailUseCase } from "../use-cases/invoice-detail.use-case";
import { PayablePortfolioUseCase } from "../use-cases/payable-portfolio.use-case";
import { ReceivablePortfolioUseCase } from "../use-cases/receivable-portfolio.use-case";
import { SalesDayUseCase } from "../use-cases/sales-day.use-case";


export const salesDayUseCaseCompositor = (req: Request): SalesDayUseCase => {
    const db = new MySQLAdapter(req as any);
    const service = new ReportsService(db);
    return new SalesDayUseCase(service);
};

export const detailSalesDayByWarehouseUseCaseCompositor = (req: Request) =>
    new DetailSalesDayByWarehouseUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );

export const invoiceDetailUseCaseCompositor = (req: Request) =>
    new InvoiceDetailUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );

export const cumulativeSalesUseCaseCompositor = (req: Request) =>
    new CumulativeSalesUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );

export const cashCountsUseCaseCompositor = (req: Request) =>
    new CashCountsUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );

export const receivablePortfolioUseCaseCompositor = (req: Request) =>
    new ReceivablePortfolioUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );

export const payablePortfolioUseCaseCompositor = (req: Request) =>
    new PayablePortfolioUseCase(
        new ReportsService(new MySQLAdapter(req as any))
    );