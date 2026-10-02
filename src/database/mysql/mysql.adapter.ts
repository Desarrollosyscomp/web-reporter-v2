// ==================== IMPORTACIONES ====================
import { RequestWithTenant } from '../../types/request-with-tenant';
import { DatabaseConnection } from '../database.interface';
import { MySQLConnectionFactory } from './mysql.connection';
import { PoolConnection } from 'mysql2/promise';

// ==================== ADAPTADOR MYSQL: MySQLAdapter ====================
export class MySQLAdapter implements DatabaseConnection {
    // -------------------- Constructor / inyección de dependencias --------------------
    public constructor(private readonly request: RequestWithTenant) { }

    // -------------------- Pool del tenant actual --------------------
    private get pool() {
        if (!this.request.tenant) {
            throw new Error('Base de datos no resuelta');
        }

        const { host, database, user, password } = this.request.tenant;
        return MySQLConnectionFactory.getPool(host, database, user, password);
    }

    // -------------------- Obtener conexión del pool --------------------
    public async getConnection(): Promise<PoolConnection> {
        return this.pool.getConnection();
    }

    // -------------------- Ejecutar consulta (query) --------------------
    public async query<T = any>(
        connection: PoolConnection,
        sql: string,
        params: any[] = []
    ): Promise<T> {
        const [rows] = await connection.query(sql, params);
        return rows as T;
    }

    // -------------------- Ejecutar sentencia preparada (execute) --------------------
    public async execute<T = any>(
        connection: PoolConnection,
        sql: string,
        params: any[] = []
    ): Promise<T> {
        const [result] = await connection.execute(sql, params);
        return result as T;
    }

    // -------------------- Liberar conexión al pool --------------------
    public release(connection: PoolConnection): void {
        connection.release();
    }
}
