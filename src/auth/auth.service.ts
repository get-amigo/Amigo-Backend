import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { generalError } from 'src/utils/generalError';
import Twilio from 'twilio';
import getCountryCodeAndPhoneNumber from 'src/utils/getCountryCodeAndPhoneNumber';
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

  async verifyFirebaseOtp(sessionInfo, code) {
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${apiKey}`;
    const requestBody = {
      sessionInfo,
      code,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  async verifyOTP(otpBody, response) {
    try {
      const { sessionInfo, code } = otpBody;
      const { phoneNumber:phoneNumberWithCountryCode } = await this.verifyFirebaseOtp(
        sessionInfo,
        code,
      );
      const { phoneNumber, countryCode } = getCountryCodeAndPhoneNumber(
        phoneNumberWithCountryCode,
      );

      let user = await this.userService.findOrCreateUser(
        phoneNumber,
        countryCode,
      );

      this.login(user, response);
    } catch (error) {
      response.json({
        error: 'Failed to verify OTP. Please try again later.' + error,
      });
    }
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
