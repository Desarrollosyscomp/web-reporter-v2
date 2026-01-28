import { TServiceResponse } from '../local-responses/response-types/service-response.type';
import { DatabaseConnection } from '../database/database.interface';

export class WarehousesService {

  public constructor(private readonly db: DatabaseConnection) { }

  public async findAll(): Promise<TServiceResponse> {
    const connection = await this.db.getConnection();
    try {
      const [rows] = await connection.query(`SELECT idalmacen, nomalmacen FROM almacenes WHERE activo = 1`);
      return { data: { warehouses: rows }, error: false };
    } catch (error) {
      return { error: true, data: error };
    } finally {
      this.db.release(connection);
    }
  }
}
