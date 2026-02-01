import { TLocalResponse } from '../response-types/local-response.type';
import { TRawPaginatedData } from '../response-types/raw-paginated-data';
import { TUseCaseResponse } from '../response-types/use-case-response.type';
import { PaginatorResponse } from './paginator-response';

type UseCaseParams = {
    data: any;
    error?: any;
    status?: number;
    limit?: number;
}

export class UseCaseResponse<T = any> implements TLocalResponse<T> {
    public data: T;
    public status: number;
    public error: boolean;
    public limit: number;
    public constructor(params: UseCaseParams) {
        this.setData(params.data);
        if (params.status != undefined) {
            this.setStatus(params.status);
        }
        this.setStatus(params.status || 200);
        this.setError(params.error);
        if (params.limit != undefined) {
            this.setLimit(params.limit);
        }
    }
    public setLimit(limit: number): void {
        this.limit = limit;
    }
    public getLimit(): number {
        return this.limit;
    }
    public setError(error: boolean): void {
        this.error = error;
    }
    public getError(): boolean {
        return this.error;
    }
    public setData(data: T): void {
        this.data = data;
    }
    public getData(): T {
        return this.data;
    }
    public setStatus(status: number): void {
        this.status = status;
    }
    public getStatus(): number {
        return this.status;
    }
    public getResponse(): TUseCaseResponse {
        const error = this.getError();
        // if (error) {
        //   return this.parseError();
        // }
        const limit = this.getLimit();
        if (limit == undefined || error) {
            return this.parseSimpleResponse();
        }

        return this.parsePaginatorResponse();
    }
    public parseSimpleResponse(): TUseCaseResponse {
        let status = this.getStatus();
        const data = this.getData();
        return {
            status,
            data,
        };
    }
    public parsePaginatorResponse(): TUseCaseResponse {
        const data = this.getData() as TRawPaginatedData;;
        const limit = this.getLimit();
        const status = this.getStatus();
        //const paginator = new PaginatorResponse([data[0], data[1]], limit);
        const paginator = new PaginatorResponse(
            [data.list, data.count],
            limit,
        );

        // return {
        //     status,
        //     data: paginator.getPaginationResponse(),
        // };

        return {
            status,
            data: {
                ...paginator.getPaginationResponse(),
                ...(data.summary && { summary: data.summary }),
            },
        };
    }
}