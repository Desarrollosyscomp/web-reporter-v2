import { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export type MySQLPool = Pool;
export type MySQLConnection = PoolConnection;
export type MySQLQueryResult<T> = T & RowDataPacket[];
export type MySQLExecuteResult = ResultSetHeader;
