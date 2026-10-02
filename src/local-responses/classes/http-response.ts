// ==================== IMPORTACIONES ====================
import { THttpResponseType } from '../response-types/http-response.type';
// ==================== CLASE DE RESPUESTA: HttpResponse ====================
export class HttpResponse implements THttpResponseType {
    public response: any;
    public status: number;
    public message: string;
    public name: string;
    // -------------------- Constructor / inyección de dependencias --------------------
    public constructor(response: any, status: number, message?: string, name?: string) {
        this.setResponse(response);
        this.setStatus(status);
        this.setMessage(message ?? 'Http Response');
        this.setName(name ?? 'HttpResponse');
    }
    // -------------------- Getters y setters --------------------
    public setResponse(response: any) {
        this.response = response;
    }
    // -------------------- Construcción de la respuesta final --------------------
    public getResponse() {
        return this.response;
    }
    public setStatus(status: number) {
        this.status = status;
    }
    public getStatus() {
        return this.status;
    }
    public setMessage(message: string) {
        this.message = message;
    }
    public getMessage() {
        return this.message;
    }
    public setName(name: string) {
        this.name = name;
    }
    public getName() {
        return this.name;
    }

}