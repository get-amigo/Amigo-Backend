import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { generalError } from 'src/utils/generalError';
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
