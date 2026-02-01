import { MySQLAdapter } from "../../database/mysql/mysql.adapter";
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