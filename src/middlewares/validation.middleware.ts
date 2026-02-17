import { HttpException, HttpStatus, Injectable, NestMiddleware, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { NextFunction, Request, Response } from "express";

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
    public constructor(private readonly jwtService: JwtService,) { }

    public use(@Req() req: Request, res: Response, next: NextFunction) {
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

            req.user = {
                id: payload.tokenObject.client_id,
            };
            next();
        } catch (error) {
            throw new HttpException(
                'Invalid or expired token',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }
}

