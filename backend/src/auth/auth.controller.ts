import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { mapUser } from '../common/mappers';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const { token, user } = await this.auth.register(
      dto.email,
      dto.password,
      dto.name,
    );
    return { token, user: mapUser(user) };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const { token, user } = await this.auth.login(dto.email, dto.password);
    return { token, user: mapUser(user) };
  }

  @Post('google')
  @HttpCode(200)
  async google(@Body() dto: GoogleAuthDto) {
    const { token, user } = await this.auth.googleAuth(dto.idToken);
    return { token, user: mapUser(user) };
  }
}
