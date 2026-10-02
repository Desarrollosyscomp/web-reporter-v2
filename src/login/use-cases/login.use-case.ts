// ==================== IMPORTACIONES ====================
import { JwtService } from "@nestjs/jwt";
import { UseCaseResponse } from "../../local-responses/classes/use-case-response";
import { TUseCaseResponse } from "../../local-responses/response-types/use-case-response.type";
import { LoginService } from "../login.service";
import * as bcrypt from 'bcrypt';

// ==================== CASO DE USO: LoginUseCase ====================
export class LoginUseCase {
    private readonly jwtService: JwtService;
    // -------------------- Constructor / inyección de dependencias --------------------
    public constructor(private readonly loginService: LoginService) {
        this.jwtService = new JwtService({
            secret: process.env.JWT_SECRET,
            signOptions: {
                algorithm: process.env.JWT_ALGORITHMS as any,
            },
        })
    }

    // -------------------- Orquestación del caso de uso --------------------
    public async main(username: string, password: string): Promise<TUseCaseResponse> {
        // Búsqueda del usuario
        const { data, error, } = await this.loginService.login(username, password);
        if (!data.user) {
            return new UseCaseResponse({
                data: { message: 'Usuario no encontrado' },
                status: 0,
                error: true,
            }).getResponse();
        }
        // Validación de contraseña (bcrypt)
        const rightPassword = await bcrypt.compare(
            password,
            data.user.password,
        );

        if (!rightPassword) {
            return new UseCaseResponse({
                data: { message: 'Contraseña incorrecta' },
                status: 0,
                error: true,
            }).getResponse();
        }
        // Generación del token JWT
        const date = new Date();
        date.setDate(date.getDate() + 3);
        const tokenObject = {
            username: data.user.username,
            client_id: data.user.client_id,
            exp: date.getTime(),
        };
        const token = await this.jwtService.signAsync({ tokenObject });

        return new UseCaseResponse({
            data:{token},
            error,
            status: 1,
        }).getResponse();

    }
}