// ==================== IMPORTACIONES ====================
import { HttpStatus } from "@nestjs/common";

// ==================== MAPA DE ESTADOS LÓGICOS → HTTP (almacenes) ====================
const warehousesStatusMap: Record<string, Record<number, number>> = {

    findAllWarehouses: {
        0: HttpStatus.CONFLICT,
        1: HttpStatus.OK,
    },
}

// ==================== RESOLVER CÓDIGO HTTP (almacenes) ====================
export const getHttpStatusWarehouses = (
    controller: string,
    status: number,
): number => {
    return warehousesStatusMap[controller][status] ?? 501;
};
