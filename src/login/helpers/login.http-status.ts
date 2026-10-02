// ==================== IMPORTACIONES ====================
import { HttpStatus } from "@nestjs/common";

// ==================== MAPA DE ESTADOS LÓGICOS → HTTP (login) ====================
const loginStatusMap: Record<string, Record<number, number>> = {
    login: {
        0: HttpStatus.CONFLICT,
        1: HttpStatus.OK,
    },
};

// ==================== RESOLVER CÓDIGO HTTP (login) ====================
export const getHttpStatusLogin = (controller: string, status: number): number => {
    return loginStatusMap[controller][status] ?? HttpStatus.INTERNAL_SERVER_ERROR;
};