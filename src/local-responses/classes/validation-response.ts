import { ValidationDataInterface } from '../response-types/validation-data.type';
import { ValidationResponseInterface } from '../response-types/validation-response.type';

export class ValidationResponse implements ValidationResponseInterface {
    success: boolean = true;
    data: ValidationDataInterface;
    public constructor(success: boolean, data: ValidationDataInterface) {
        this.setSuccess(success);
        this.setData(data);
    }
    public setSuccess(success: boolean) {
        this.success = success;
    }
    public getSuccess() {
        return this.success;
    }
    public setData(data: ValidationDataInterface) {
        this.data = data;
    }
    public getData(): ValidationDataInterface {
        return this.data;
    }
    public getStatus() {
        const _data = this.getData();
        return _data.status;
    }
    public getHttpResponse() {
        return {
            validationError: {
                message: this.data.message,
                status: this.data.status,
            },
        };
    }
}