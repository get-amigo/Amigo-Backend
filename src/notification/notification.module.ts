import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import DeviceTokenSchema from './device-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([DeviceTokenSchema]),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
