import { Request } from 'express';

export type TTenantMySQLConfig = {
    host: string;
    database: string;
}

export interface RequestWithTenant extends Request {
  tenant?: TTenantMySQLConfig;
  user?: {
    id: number;
  };
}