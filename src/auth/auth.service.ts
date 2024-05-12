import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { generalError } from 'src/utils/generalError';
import Twilio from 'twilio';
import firebase from 'firebase-admin';
import getCountryCodeAndPhoneNumber from 'src/utils/getCountryCodeAndPhoneNumber';

let app: firebase.app.App;

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
      if (!app) {
        app = firebase.initializeApp({
          credential: firebase.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
      }
      const decodedToken = await app.auth().verifyIdToken(payload);
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
