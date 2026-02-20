import postgresDatasource from "../database/postgres/postgres.connection";
import { ConxposUtilityAuth } from "../postgres-entities/conxpos-utility-auth.entity";
import { ConxposUtilityDataBase } from "../postgres-entities/conxpos-utility-databases.entity";

export class TenantDatabaseService {

  public async getMysqlCredentials(clientId: number) {
    const ds = await postgresDatasource();

    const authRepo = ds.getRepository(ConxposUtilityAuth);
    const dbRepo = ds.getRepository(ConxposUtilityDataBase);

    const auth = await authRepo.findOne({
      where: { client_id: clientId, status: 1 },
    });

    const db = await dbRepo.findOne({
      where: { client_id: clientId, is_active: true },
    });

    if (!auth || !db) {
      throw new Error('Configuración de base de datos no encontrada');
    }

    return {
      host: auth.database_ip,
      database: db.database_name,
    };
  }
}
