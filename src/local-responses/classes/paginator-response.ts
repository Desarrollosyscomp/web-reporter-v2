// ==================== IMPORTACIONES ====================
import { TPaginator } from '../response-types/paginator.type';

// ==================== CLASE DE RESPUESTA: PaginatorResponse ====================
export class PaginatorResponse {
    paginationData: [Array<any>, number];
    limit: number;
    // -------------------- Constructor / inyección de dependencias --------------------
    constructor(paginationData: [Array<any>, number], limit: number) {
        this.setPaginationData(paginationData);
        this.setLimit(limit);
    }
    // -------------------- Getters y setters --------------------
    public setLimit(limit: number) {
        this.limit = limit;
    }
    public getLimit() {
        return this.limit;
    }
    public setPaginationData(paginationData: [Array<any>, number]) {
        this.paginationData = paginationData;
    }
    public getPaginationData() {
        return this.paginationData;
    }
    // -------------------- Cálculo de paginación --------------------
    public getPaginationResponse(): TPaginator {
        const list = this.getPaginationData()[0];
        const count = this.getPaginationData()[1];
        const _limit = this.getLimit();
        const totalPages = Math.ceil(count / _limit);
        return {
            list,
            count,
            totalPages,
        };
    }
}