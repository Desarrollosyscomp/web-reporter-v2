import { config } from 'dotenv';
config();
export const databaseConfig = {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'test_database',
    connectionLimit: 20,
    waitForConnections: true,
    queueLimit: 0,
    connectLimit: 10000,
    acquireTimeout: 10000,
};
