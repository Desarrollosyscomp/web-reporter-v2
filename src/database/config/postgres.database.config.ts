import { config } from 'dotenv';
import { Client } from '../../postgres-entities/client.entity';
import { ConxposUtilityAuth } from '../../postgres-entities/conxpos-utility-auth.entity';
import { ConxposUtilityDataBase } from '../../postgres-entities/conxpos-utility-databases.entity';
config();

const postgresConnection = {
    type: process.env.POSTGRES_TYPE,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    entities: [
        ConxposUtilityAuth,
        ConxposUtilityDataBase,
        Client
    ],
    synchronize: false,
    logging: false,
};

export { postgresConnection };