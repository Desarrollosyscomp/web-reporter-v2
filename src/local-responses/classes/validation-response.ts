// ==================== IMPORTACIONES ====================
import { TValidationDataType } from '../response-types/validation-data.type';
import { TValidationResponseType } from '../response-types/validation-response.type';

// ==================== CLASE DE RESPUESTA: ValidationResponse ====================
export class ValidationResponse implements TValidationResponseType {
    success: boolean = true;
    data: TValidationDataType;
    // -------------------- Constructor / inyección de dependencias --------------------
    public constructor(success: boolean, data: TValidationDataType) {
        this.setSuccess(success);
        this.setData(data);
    }
    // -------------------- Getters y setters --------------------
    public setSuccess(success: boolean) {
        this.success = success;
    }
    public getSuccess() {
        return this.success;
    }
    public setData(data: TValidationDataType) {
        this.data = data;
    }
    public getData(): TValidationDataType {
        return this.data;
    }
    public getStatus() {
        const _data = this.getData();
        return _data.status;
    }
    // -------------------- Cuerpo HTTP de error de validación --------------------
    public getHttpResponse() {
        return {
            validationError: {
                message: this.data.message,
                status: this.data.status,
            },
        };
    }
}