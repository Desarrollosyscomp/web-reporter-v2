// ==================== IMPORTACIONES ====================
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

// ==================== GUARD: TestGuard ====================
@Injectable()
export class TestGuard implements CanActivate {
  // -------------------- Guard de prueba (siempre bloquea) --------------------
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return false;
  }
}
