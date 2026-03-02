import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import postgresDatasource from "../database/postgres/postgres.connection";
import { ConxposUtilityAuth } from "../postgres-entities/conxpos-utility-auth.entity";
import { ConxposUtilityDataBase } from "../postgres-entities/conxpos-utility-databases.entity";
import type { Ttenant } from '../types/request-with-tenant';

@Injectable()
export class TenantDatabaseService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async getMysqlCredentials(clientId: number): Promise<Ttenant> {
    const cacheKey = `tenant_${clientId}`;
    
    const cachedTenant = await this.cacheManager.get<Ttenant>(cacheKey);
    if (cachedTenant) {
      return cachedTenant;
    }
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

    const tenantConfig: Ttenant = {
      database: db.database_name,
      ip: auth.database_ip,
    };
    await this.cacheManager.set(cacheKey, tenantConfig);

    return tenantConfig;
  }
}
