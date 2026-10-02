// ==================== IMPORTACIONES ====================
import { createPool, Pool } from 'mysql2/promise';
import { databaseConfig } from '../config/database.config';

// ==================== TIPOS ====================
// ==================== FÁBRICA DE POOLS MYSQL: MySQLConnectionFactory ====================
type PoolKey = string;
export class MySQLConnectionFactory {
  private static pools: Map<PoolKey, Pool> = new Map();

  // -------------------- Obtener o crear pool por host/base/usuario --------------------
  public static getPool(host: string, database: string, user: string, password: string): Pool {
    const key = `${host}_${database}_${user}`;
    if (!this.pools.has(key)) {
      const pool = createPool({
        host,
        port: databaseConfig.port,
        user,
        password,
        database,
        connectionLimit: databaseConfig.connectionLimit,
        waitForConnections: true,
      });
      this.pools.set(key, pool);
    }
    return this.pools.get(key)!;
  }
}
