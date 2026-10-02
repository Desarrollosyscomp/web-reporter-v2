// ==================== IMPORTACIONES ====================
import { MySQLAdapter } from "../../database/mysql/mysql.adapter";
import { CashCountsValidator } from "../validators/cash-counts.validator";
import { InvoiceDetailValidator } from "../validators/invoice-detail.validator";
import { SalesDayValidator } from "../validators/sales-day.validator";

// ==================== COMPOSITOR DE VALIDADOR: ventas del día ====================
export const salesDayValidatorCompositor = (req: Request): SalesDayValidator => {

    const db = new MySQLAdapter(req as any);
    return new SalesDayValidator(db);
}

// ==================== COMPOSITOR DE VALIDADOR: detalle de factura ====================
export const invoiceDetailValidatorCompositor = (req: Request): InvoiceDetailValidator => {
    const db = new MySQLAdapter(req as any);
    return new InvoiceDetailValidator(db);
}

// ==================== COMPOSITOR DE VALIDADOR: arqueos de caja ====================
export const cashCountsValidatorCompositor = (req: Request): CashCountsValidator => {
    const db = new MySQLAdapter(req as any);
    return new CashCountsValidator(db);
}