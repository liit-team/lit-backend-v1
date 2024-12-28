import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegisterUserDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() data: RegisterUserDto) {
    return await this.authService.registerUser(data);
  }
}
