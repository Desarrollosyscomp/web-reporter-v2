// ==================== IMPORTACIONES ====================
import { DatabaseConnection } from "../../database/database.interface";
import { ValidatorInterface } from "../../local-responses/interfaces/validator.interface";
import { ValidationResponse } from "../../local-responses/classes/validation-response";

// ==================== VALIDADOR: SalesDayValidator ====================
export class SalesDayValidator implements ValidatorInterface {
    // -------------------- Constructor / inyección de dependencias --------------------
    public constructor(private readonly db: DatabaseConnection) { }
    // -------------------- Validación principal --------------------
    public async validate(init_date: string): Promise<ValidationResponse> {

        const salesCheck = await this.existsSales(init_date);
        if (!salesCheck.success) {
            return salesCheck;
        }
        return new ValidationResponse(true, {
            status: 1,
            message: "Validación exitosa",
        });

    }
    // -------------------- Verificar existencia de ventas en la fecha --------------------
    private async existsSales(init_date: string): Promise<ValidationResponse> {
        const connection = await this.db.getConnection();
        try {
            // Consulta SQL: listado principal
            const query = `
        SELECT 1
        FROM facturas f
        INNER JOIN almacenes a
          ON f.idalmacen = a.idalmacen
          AND a.idempresa = 1
        WHERE f.fecha = ?
          AND f.estado = 0
        LIMIT 1
      `;

            const [rows]: any = await connection.query(query, [init_date]);

            if (!rows || rows.length === 0) {
                return new ValidationResponse(false, {
                    status: 4,
                    message: `No existen ventas para la fecha ${init_date}`,
                });
            }
            return new ValidationResponse(true, {
                message: "Datos encontrados",
            });
        } catch (error) {
            return new ValidationResponse(false, {
                status: 0,
                message: `Error al buscar facturas: ${error.message}`,
            });
        } finally {
            if (connection) {
                this.db.release(connection);
            }
        }
    }
}