import { DatabaseConnection } from "../../database/database.interface";
import { ValidationResponse } from "../../local-responses/classes/validation-response";
import { ValidatorInterface } from "../../local-responses/interfaces/validator.interface";

export class CashCountsValidator implements ValidatorInterface {
    public constructor(private readonly db: DatabaseConnection) { }

    public async validate(date: string, warehouse_id: number): Promise<ValidationResponse> {
        const checkData = await this.existData(date, warehouse_id);
        if (!checkData.success) {
            return checkData;
        }
        return new ValidationResponse(true, {
            status: 1,
            message: "Validación exitosa",
        });
    }

    private async existData(date: string, warehouse_id: number): Promise<ValidationResponse> {
        const connection = await this.db.getConnection();
        try {
            const _date = date.split(' ')[0];
            const query = `
            SELECT 1
            FROM arqueo a
            WHERE a.idalmacen = ?
            AND DATE(a.fechaap) = ?
            LIMIT 1;
           `;
            const params = [warehouse_id, _date]
            const [rows] = await connection.query(query, params)
            if (!rows || rows.length === 0) {
                return new ValidationResponse(false, {
                    status: 4,
                    message: `No existen datos de arqueos para la fecha ${date} y almacén ${warehouse_id}`
                });
            }
            return new ValidationResponse(true, {
                message: "Validación exitosa",
            })
        } catch (error) {
            return new ValidationResponse(false, {
                status: 0,
                message: `Error al buscar arqueos: ${error.message}`,
            });
        } finally {
            if (connection) {
                this.db.release(connection);
            }
        }
    }
}