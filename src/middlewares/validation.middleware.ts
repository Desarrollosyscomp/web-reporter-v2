// ==================== IMPORTACIONES ====================
import { HttpException, HttpStatus, Injectable, NestMiddleware, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { NextFunction, Request, Response } from "express";
import type { RequestWithTenant, Ttenant } from '../types/request-with-tenant';
import { TenantDatabaseService } from '../admin/tenant-database.service';

// ==================== MIDDLEWARE: ValidationMiddleware ====================
@Injectable()
export class ValidationMiddleware implements NestMiddleware {
    // -------------------- Constructor / inyección de dependencias --------------------
    public constructor(
        private readonly jwtService: JwtService,
        private readonly tenantService: TenantDatabaseService
    ) { }

    // -------------------- Autenticación JWT y resolución del tenant --------------------
    public async use(@Req() req: RequestWithTenant, res: Response, next: NextFunction) {
        // Lectura del encabezado Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(HttpStatus.UNAUTHORIZED).send({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'Bearer token not found',
            });
        // Verificación del token
        const [, token] = authHeader.split(' ');
        try {
            const payload: any = this.jwtService.verify(token, {
                ignoreExpiration: true,
            });

            // Resolución del tenant
            const clientId = payload.tokenObject.client_id;
            const tenantInfo: Ttenant = await this.tenantService.getMysqlCredentials(clientId);
            
            // Asociación del tenant a la request
            req.user = { id: clientId };
            req.tenant = {
                host: tenantInfo.ip,
                database: tenantInfo.database,
                user: tenantInfo.user,
                password: tenantInfo.password,
            };
            next();
        } catch {
            return res.status(HttpStatus.UNAUTHORIZED).send({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'Invalid token or inactive license',
            });
        }
    }
}
