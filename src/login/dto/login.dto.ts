import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'usuario para login', example: 'pedro perez' })
  @IsNotEmpty({ message: 'El usuario no puede estar vacío' })
  @IsString()
  readonly username: string;

  @ApiProperty({ description: 'contraseña para login', example: 'password123' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @IsString()
  readonly password: string;
}

