import { Request } from 'express';

export type TTenantMySQLConfig = {
    host: string;
    database: string;
    user: string;
    password: string;
}

export type Ttenant = {
    database: string;
    ip: string;
    user: string;
    password: string;
}

export interface RequestWithTenant extends Request {
  tenant?: TTenantMySQLConfig;
  user?: {
    id: number;
  };
}