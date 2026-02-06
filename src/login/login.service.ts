import { Injectable } from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto';

@Injectable()
export class LoginService {
  public async login(createLoginDto: CreateLoginDto) {
    return 'This action adds a new login';
  }


}
