import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationSchema, DeviceTokenSchema } from './notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([NotificationSchema, DeviceTokenSchema]),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
