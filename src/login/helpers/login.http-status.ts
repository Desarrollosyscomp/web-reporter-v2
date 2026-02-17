import { HttpStatus } from "@nestjs/common";

const loginStatusMap: Record<string, Record<number, number>> = {
    login: {
        0: HttpStatus.CONFLICT,
        1: HttpStatus.OK,
    },
};

export const getHttpStatusLogin = (controller: string, status: number): number => {
    return loginStatusMap[controller][status] ?? HttpStatus.INTERNAL_SERVER_ERROR;
};