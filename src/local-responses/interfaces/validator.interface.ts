// ==================== IMPORTACIONES ====================
import { ValidationResponse } from "../classes/validation-response";

// ==================== TIPOS ====================
export interface ValidatorInterface {
  validate(...params: any): Promise<ValidationResponse>;
}

export interface NotAsyncValidatorInterface {
  validate(...params: any): ValidationResponse;
}