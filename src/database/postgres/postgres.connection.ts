import { DataSource } from 'typeorm';
import { postgresConnection } from '../config/postgres.database.config';

const postgresDatasource = async (): Promise<DataSource> => {
    const dataSource = new DataSource({
        type: postgresConnection.type as any,
        host: postgresConnection.host,
        port: postgresConnection.port,
        username: postgresConnection.username,
        password: postgresConnection.password,
        database: postgresConnection.database,
        entities: postgresConnection.entities,
        synchronize: postgresConnection.synchronize,
        logging: postgresConnection.logging,
        connectTimeoutMS: 10000,
        extra: {
            max: 10,
            connectionTimeoutMillis: 10000,
        }
    });

    try {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }
        return dataSource;
    } catch (error) {
        console.error("❌ Error during Data Source initialization", {
            message: error.message,
            code: error.code,
            host: postgresConnection.host,
            port: postgresConnection.port
        });
        throw error;
    }
}

export default postgresDatasource;
