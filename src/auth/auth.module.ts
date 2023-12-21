import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthStrategy } from './auth.strategy';
import { UsersService } from 'src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema from 'src/users/users.schema';

@Module({
  controllers: [AuthController],
  imports: [
    UsersModule,
    MongooseModule.forFeature([UserSchema]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('ACCESS_CODE_EXPIRY'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthStrategy, AuthService, UsersService],
})
export class AuthModule {}
