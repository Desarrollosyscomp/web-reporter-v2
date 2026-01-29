import { HttpStatus } from "@nestjs/common";

const reportsStatusMap: Record<string, Record<number, number>> = {
    salesDay: {
        0: HttpStatus.CONFLICT,
        1: HttpStatus.OK,
    },
}

export const getHttpStatusReports = (controller: string, status: number): number => {
    return reportsStatusMap[controller][status] ?? 501;
};