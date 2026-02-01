import { DatabaseConnection } from "../../database/database.interface";
import { ValidationResponse } from "../../local-responses/classes/validation-response";
import { ValidatorInterface } from "../../local-responses/interfaces/validator.interface";

export class InvoiceDetailValidator implements ValidatorInterface {
    public constructor(private readonly db: DatabaseConnection) { }

    public async validate(invoice_number: number, warehouse_id: number): Promise<ValidationResponse> {
        const _existInvoice = await this.existInvoice(invoice_number, warehouse_id);
        if (!_existInvoice.success) {
            return _existInvoice;
        }
        return new ValidationResponse(true, {
            status: 1,
            message: "Validación exitosa",
        });
    }

    private async existInvoice(invoice_number: number, warehouse_id: number): Promise<ValidationResponse> {
        const connection = await this.db.getConnection();

        try {
            const query = `
        SELECT 1
        FROM facturas f
        WHERE f.numero = ?
        AND f.idalmacen = ?
        LIMIT 1
      `;
            const [rows]: any = await connection.query(query, [invoice_number, warehouse_id]);
            if (!rows || rows.length === 0) {
                return new ValidationResponse(false, {
                    status: 4,
                    message: `No existen ventas con el número ${invoice_number} para el almacén ${warehouse_id}`,
                });
            }
            return new ValidationResponse(true, {
                message: "Validación exitosa",
            });
        } catch (error) {
            return new ValidationResponse(false, {
                status: 0,
                message: `Error al buscar facturas: ${error.message}`,
            });

        }
        finally {
            if (connection) {
                this.db.release(connection);
            }
        }
    }


}