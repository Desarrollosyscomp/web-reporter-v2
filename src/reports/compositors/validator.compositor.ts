import { MySQLAdapter } from "../../database/mysql/mysql.adapter";
import { CashCountsValidator } from "../validators/cash-counts.validator";
import { InvoiceDetailValidator } from "../validators/invoice-detail.validator";
import { SalesDayValidator } from "../validators/sales-day.validator";

export const salesDayValidatorCompositor = (): SalesDayValidator => {
    const db = new MySQLAdapter();
    return new SalesDayValidator(db);
}

export const invoiceDetailValidatorCompositor = (): InvoiceDetailValidator => {
    const db = new MySQLAdapter();
    return new InvoiceDetailValidator(db);
}

export const cashCountsValidatorCompositor = (): CashCountsValidator => {
    const db = new MySQLAdapter();
    return new CashCountsValidator(db);
}