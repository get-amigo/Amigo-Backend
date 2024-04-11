import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema from './users.schema';
import GroupSchema from 'src/group/group.schema';

@Module({
  imports: [MongooseModule.forFeature([UserSchema,GroupSchema])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
