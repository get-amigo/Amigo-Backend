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
import { JwtAuthGuard } from './jwt-auth.guard';

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

  @UseGuards(new JwtAuthGuard('jwt'))
  @Post('/editPhoneNumber')
  async verifyOTPAndEditPhoneNumber(@Body() otpBody,@Req() req: Request,@Res() response) {
    const { id } = req['user'];
    this.authService.verifyOTPAndEditPhoneNumber(id,otpBody,response);
  }

}
