import { Controller, Post, Body, Res } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { loginUseCaseCompositor } from './compositors/use-case.compositors';
import { getHttpStatusLogin } from './helpers/login.http-status';
import { HttpResponse } from 'src/local-responses/classes/http-response';

@ApiTags('Auth')
@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) { }

  @Post('auth')
  @ApiOperation({ summary: 'Iniciar sesión para retorno de token' })
  @ApiBody({
    description: 'Logueo de usuario con username y password',
    type: LoginDto,
  })
  public async login(@Res() response: Response, @Body() loginDto: LoginDto): Promise<Response> {
    const { username, password } = loginDto;
    const { data, status } = await loginUseCaseCompositor().main(username, password);
    let httpStatus = getHttpStatusLogin('login', status || 0);
    return response.status(httpStatus).send(new HttpResponse(data, httpStatus));
  }

}
