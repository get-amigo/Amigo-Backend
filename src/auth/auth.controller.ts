import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() user) {
    const userData = await this.authService.signUpUser(user);
    return userData;
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() user, @Res() response: Response) {
    const userData = await this.authService.verifyUser(user);
    return this.authService.login(userData, response);
  }
}
