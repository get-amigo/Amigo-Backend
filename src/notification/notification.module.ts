import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from 'src/users/users.module';
import { GroupModule } from 'src/group/group.module';
import { NotificationService } from './notification.service';
import GroupSchema from 'src/group/group.schema';
import UsersSchema from 'src/users/users.schema';
import { NotificationController } from './notification.controller';
import DeviceTokenSchema from './device-token.schema';

@Module({
  imports: [
    UsersModule,
    GroupModule,
    MongooseModule.forFeature([DeviceTokenSchema, GroupSchema, UsersSchema]),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule { }
