// ==================== IMPORTACIONES ====================
import { HttpStatus } from "@nestjs/common";

// ==================== MAPA DE ESTADOS DE VALIDACIÓN → HTTP (reportes) ====================
const reportsValidatorHttpStatusMap: Record<string, Record<number, number>> = {
    validateSales: {
        0: HttpStatus.CONFLICT,
        3: HttpStatus.BAD_REQUEST,
        4: HttpStatus.NOT_FOUND,
        1: HttpStatus.OK,
    },
    validateInvoiceDetail: {
        0: HttpStatus.CONFLICT,
        3: HttpStatus.BAD_REQUEST,
        4: HttpStatus.NOT_FOUND,
        1: HttpStatus.OK,
    },
    validateCashCounts: {
        0: HttpStatus.CONFLICT,
        3: HttpStatus.BAD_REQUEST,
        4: HttpStatus.NOT_FOUND,
        1: HttpStatus.OK,
    }
}

// ==================== RESOLVER CÓDIGO HTTP DE VALIDACIÓN ====================
export const getValidationHttpStatus = (controller: string, status: number): number => {
    return reportsValidatorHttpStatusMap[controller][status] ?? 501;
};