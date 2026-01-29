import { TValidationResponseType } from "../response-types/validation-response.type";

export interface ValidatorInterface {
  validate(...params: any): Promise<TValidationResponseType>;
}
export interface NotAsyncValidatorInterface {
  validate(...params: any): TValidationResponseType;
}