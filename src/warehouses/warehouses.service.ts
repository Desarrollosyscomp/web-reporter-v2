// ==================== IMPORTACIONES ====================
import { TServiceResponse } from '../local-responses/response-types/service-response.type';
import { DatabaseConnection } from '../database/database.interface';

// ==================== SERVICIO: WarehousesService ====================
export class WarehousesService {

  // -------------------- Constructor / inyección de dependencias --------------------
  public constructor(private readonly db: DatabaseConnection) { }

  // -------------------- Consulta de almacenes activos --------------------
  public async findAll(): Promise<TServiceResponse> {
    const connection = await this.db.getConnection();
    try {
      // Consulta SQL: almacenes activos
      const sql = `SELECT idalmacen, nomalmacen FROM almacenes WHERE activo = 1`;
      const [rows] = await connection.query(sql);
      return { data: { warehouses: rows }, error: false };
    } catch (error) {
      return { error: true, data: error };
    } finally {
      this.db.release(connection);
    }
  }
}
