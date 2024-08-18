import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { generalError } from 'src/utils/generalError';
import getCountryCodeAndPhoneNumber from 'src/utils/getCountryCodeAndPhoneNumber';
import { verifyToken } from 'src/utils/firebase';

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

  async login(phoneNumber: string) {
    const { phoneNumber: phoneNumberWithoutCountryCode, countryCode } =
      getCountryCodeAndPhoneNumber(phoneNumber);

    const user = await this.userService.findOrCreateUser(
      phoneNumberWithoutCountryCode,
      countryCode,
    );
    const token = this.getAuthToken(user);

    return {
      token,
      user,
    };
  }

  async verifyFirebaseOtp(payload: string) {
    try {
      const decodedToken = await verifyToken(payload);
      return decodedToken.phone_number;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  async verifyDevModeOtp(payload: string) {
    try {
      return payload;
    } catch (error) {
      console.log('Error verifying OTP:', error);
      throw error;
    }
  }

  async verifyOTP(otpBody) {
    let phoneNumberWithCountryCode: string;
    try {
      const { payload } = otpBody;

      if (process.env.ENV === 'development' || process.env.ENV === 'dev') {
        phoneNumberWithCountryCode = await this.verifyDevModeOtp(payload);
      } else {
        phoneNumberWithCountryCode = await this.verifyFirebaseOtp(payload);
      }

      return await this.login(phoneNumberWithCountryCode);
    } catch (error) {
      return {
        error: 'Failed to verify OTP. Please try again later.' + error,
      };
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
