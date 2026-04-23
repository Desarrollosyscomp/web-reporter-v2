import { createPool, Pool } from 'mysql2/promise';
import { databaseConfig } from '../config/database.config';

type PoolKey = string;
export class MySQLConnectionFactory {
  private static pools: Map<PoolKey, Pool> = new Map();

  public static getPool(host: string, database: string): Pool {
    const key = `${host}_${database}`;
    if (!this.pools.has(key)) {
      const pool = createPool({
        host,
        port: databaseConfig.port,
        user: databaseConfig.user,
        password: databaseConfig.password,
        database,
        connectionLimit: databaseConfig.connectionLimit,
        waitForConnections: true,
      });
      console.log(this.pools.get(key));
      this.pools.set(key, pool);
    }
    return this.pools.get(key)!;
  }
}
