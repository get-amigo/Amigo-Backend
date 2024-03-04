import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { generalError } from 'src/utils/generalError';
import Twilio from 'twilio';
@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signUpUser(data) {
    data.password = await AuthService.hashPassword(data.password);
    const user = await this.userService.create(data);
    return user;
  }
  static hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return reject(err);
        }
        resolve(hash);
      });
    });
  }

  getAuthToken(userData) {
    const payload = { id: userData.id };
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }

  login(userData, response) {
    const token = this.getAuthToken(userData);
    return response.json({
      token,
      userData,
    });
  }

  async sendOTP({ phoneNumber }) {
    try {
      if (process.env.ENV !== 'production') return { status: 'verified' };
      
      const client = Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      
      const { status } = await client.verify.v2
        .services(process.env.TWILIO_VERIFICATION_SID)
        .verifications.create({ to: phoneNumber, channel: 'sms' });
      
      return status;
    } catch (error) {
      console.error("Error sending OTP:", error);
      return { error: "Failed to send OTP. Please try again later." };
    }
  }
  

  async sendOTPAndEditPhoneNumber(otpBody) {
    const { phoneNumber, countryCode } = otpBody;

    const user = this.userService.findUserPhoneNumber(phoneNumber, countryCode);
    if (user) return { status: false };

    return this.sendOTP(countryCode + phoneNumber);
  }

  async verifyOTP(otpBody, response) {
    const { phoneNumber, countryCode, otp } = otpBody;
    // Verify OTP using Twilio in production environment
    if (process.env.ENV === 'production') {
      await this.verifyTwilioOTP(phoneNumber, countryCode, otp, response);
    }

    // Find or create user based on phone number and country code
    let user = await this.userService.findOrCreateUser(
      phoneNumber,
      countryCode,
    );

    // Perform login with the user
    this.login(user, response);
  }

  async verifyOTPAndEditPhoneNumber(userId, otpBody, response) {
    const { phoneNumber, countryCode, otp } = otpBody;

    if (process.env.ENV === 'production') {
      await this.verifyTwilioOTP(phoneNumber, countryCode, otp, response);
    }

    const newUser = await this.userService.editUser(userId, {
      phoneNumber,
      countryCode,
    });
    response.json(newUser);
  }

  async verifyTwilioOTP(phoneNumber, countryCode, otp, response) {
    const client = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    const verificationToken = process.env.TWILIO_VERIFICATION_SID;

    const verificationCheck = await client.verify.v2
      .services(verificationToken)
      .verificationChecks.create({
        to: `+${countryCode}${phoneNumber}`,
        code: otp,
      });

    const { status } = verificationCheck;

    if (status !== 'approved') {
      return response.json({ status });
    }
  }

  async verifyUser(login) {
    const user = await this.userService.findByEmail(login.email);
    if (!user) {
      generalError('Invalid Credentials', 401);
    }
    const response = await AuthService.comparePassword(user, login.password);
    if (!response) {
      generalError('Invalid Credentials', 401);
    }

    return user;
  }

  static comparePassword(user, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password).then((result) => {
        if (result) {
          resolve(true);
          return;
        }
        reject(false);
      });
    });
  }
}
