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
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verifyOTP')
  async verifyOTP(@Body() otpBody, @Res() response) {
    if (process.env.ENV === 'development' || process.env.ENV === 'dev') {
      this.authService.verifyDevModeOtp(otpBody, response);
      return;
    }
    this.authService.verifyOTP(otpBody, response);
  }
}
