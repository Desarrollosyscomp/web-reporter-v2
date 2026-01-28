import { createPool, Pool } from 'mysql2/promise';
import { databaseConfig } from '../config/database.config';

export class MySQLConnectionFactory {
    private static pool: Pool;

    public static getPool(): Pool {
        if (!MySQLConnectionFactory.pool) {
            MySQLConnectionFactory.pool = createPool({
                host: databaseConfig.host,
                port: databaseConfig.port,
                user: databaseConfig.user,
                password: databaseConfig.password,
                database: databaseConfig.database,
                connectionLimit: databaseConfig.connectionLimit,
                waitForConnections: databaseConfig.waitForConnections,
                queueLimit: databaseConfig.queueLimit,
            });
        }

        return MySQLConnectionFactory.pool;
    }
}
