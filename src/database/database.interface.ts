export interface DatabaseConnection {
    getConnection(): Promise<any>;
    query<T = any>(
        connection: any,
        sql: string,
        params?: any[]
    ): Promise<T>;
    execute<T = any>(
        connection: any,
        sql: string,
        params?: any[]
    ): Promise<T>;
    release(connection: any): void;
}
