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
    private jwtService: JwtService
  ) {

  }
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

  async sendOTP({phoneNumber})
  {
    const client=Twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);
    const {status}=await client.verify.v2
  .services(process.env.TWILIO_VERIFICATION_SID)
  .verifications.create({ to: phoneNumber, channel: "sms" });
  return status;
  }

  async verifyOTP(otpBody,response)
  {
    const {phoneNumber,countryCode,otp}=otpBody;
    const client=Twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);
    const verificationToken=process.env.TWILIO_VERIFICATION_SID;
    const verificationCheck=await client.verify.v2
    .services(verificationToken)
    .verificationChecks.create({ to:  "+"+countryCode+phoneNumber, code: otp });
    const {status}=verificationCheck;
    if(status!="approved")
    return response.json({status});
    let user=await this.userService.findUserPhoneNumber(phoneNumber,countryCode);
    if(!user)
    user=await this.userService.create({phoneNumber,countryCode});
    this.login(user,response);
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
