import { LoginUseCase } from "../use-cases/login.use-case";
import { LoginService } from "../login.service";

export const loginUseCaseCompositor = ():LoginUseCase => {
    return new LoginUseCase(new LoginService());
}