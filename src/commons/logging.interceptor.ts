// ==================== IMPORTACIONES ====================
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable, tap } from 'rxjs';
  
  // ==================== INTERCEPTOR: LoggingInterceptor ====================
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    // -------------------- Medición del tiempo de respuesta --------------------
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const now = Date.now();
      const request = context.switchToHttp().getRequest();
      const { method, url } = request;
        const logger = new Logger('Tiempo de respuesta del endpoint en ms');
      return next.handle().pipe(
        tap(() => {
          const responseTime = Date.now() - now;
          logger.log(`${method} ${url} - ${responseTime}ms`);
        }),
      );
    }
  }
  