import { DatabaseConnection } from '../database.interface';
import { MySQLConnectionFactory } from './mysql.connection';
import { PoolConnection } from 'mysql2/promise';

export class MySQLAdapter implements DatabaseConnection {
    private readonly pool = MySQLConnectionFactory.getPool();

    public async getConnection(): Promise<PoolConnection> {
        return this.pool.getConnection();
    }

    public async query<T = any>(
        connection: PoolConnection,
        sql: string,
        params: any[] = []
    ): Promise<T> {
        const [rows] = await connection.query(sql, params);
        return rows as T;
    }

    public async execute<T = any>(
        connection: PoolConnection,
        sql: string,
        params: any[] = []
    ): Promise<T> {
        const [result] = await connection.execute(sql, params);
        return result as T;
    }

    public release(connection: PoolConnection): void {
        connection.release();
    }
}
