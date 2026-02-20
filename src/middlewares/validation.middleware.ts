import { HttpException, HttpStatus, Injectable, NestMiddleware, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { NextFunction, Request, Response } from "express";
import type { RequestWithTenant } from '../types/request-with-tenant';
import { TenantDatabaseService } from '../admin/tenant-database.service';
@Injectable()
export class ValidationMiddleware implements NestMiddleware {
    private tenantService = new TenantDatabaseService();
    public constructor(private readonly jwtService: JwtService,) { }

    public async use(@Req() req: RequestWithTenant, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(HttpStatus.UNAUTHORIZED).send(
                new HttpException(
                    {
                        error: 'Bearer token not found',
                        test: req.headers,
                    },
                    HttpStatus.UNAUTHORIZED,
                ),
            );
        const [, token] = authHeader.split(' ');
        try {
            const payload: any = this.jwtService.verify(token, {
                ignoreExpiration: true,
            });

            const clientId = payload.tokenObject.client_id;
            const tenantDb = await this.tenantService.getMysqlCredentials(clientId);
            req.user = { id: clientId };
            req.tenant = tenantDb;
            next();
        } catch (error) {
            throw new HttpException(
                'Invalid or expired token',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }
}

