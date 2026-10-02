// ==================== IMPORTACIONES ====================
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// ==================== GUARD: JwtAuthGuard ====================
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
