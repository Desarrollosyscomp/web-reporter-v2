import { HttpStatus } from "@nestjs/common";

const warehousesStatusMap: Record<string, Record<number, number>> = {

    findAllWarehouses: {
        0: HttpStatus.CONFLICT,
        1: HttpStatus.OK,
    },
}

export const getHttpStatusWarehouses = (
    controller: string,
    status: number,
): number => {
    return warehousesStatusMap[controller][status] ?? 501;
};
