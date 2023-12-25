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
import { response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sendOTP')
  async sendOTP(@Body() phoneNumber) {
    return this.authService.sendOTP(phoneNumber);
  }

  @Post('verifyOTP')
  async verifyOTP(@Body() otpBody, @Res() response) {
    this.authService.verifyOTP(otpBody, response);
  }
}
