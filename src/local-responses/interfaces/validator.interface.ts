import { ValidationResponse } from "../classes/validation-response";

export interface ValidatorInterface {
  validate(...params: any): Promise<ValidationResponse>;
}

export interface NotAsyncValidatorInterface {
  validate(...params: any): ValidationResponse;
}