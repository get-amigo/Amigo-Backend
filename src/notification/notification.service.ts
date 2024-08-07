import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';

import { NotificationSchema, DeviceTokenSchema } from './notification.schema';
import { CreateNotificationDto, CreateDeviceTokenDto } from './notification.dto';
import { sendPushNotification } from 'src/utils/firebase';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(NotificationSchema.name) private readonly notificationModel: Model<CreateNotificationDto>,
    @InjectModel(DeviceTokenSchema.name) private readonly deviceTokenModel: Model<CreateDeviceTokenDto>,
  ) {}

  async getTokens(userIds: string[]) {
    const tokens = await this.deviceTokenModel.find({ userId: { $in: userIds } }).exec();
    return tokens.map(({ token }) => token);
  }

  async saveTokens(createDeviceTokenDto: CreateDeviceTokenDto) {
    const createdDeviceToken = new this.deviceTokenModel(createDeviceTokenDto);
    await createdDeviceToken.save();
  }

  async sendNotification(createNotificationDto: CreateNotificationDto): Promise<void> {
    const { data, type } = createNotificationDto;

    //!! STAGE 1: Implement TRANSACTION_ADD push notification
    const userIds = data.splitAmong.map(({ user }) => user);

    const tokens = await this.getTokens(userIds);

    const message: admin.messaging.MulticastMessage = {
      data,
      tokens,
    };

    await sendPushNotification(message);

    // Save notification to the database
    const createdNotification = new this.notificationModel(createNotificationDto);
    await createdNotification.save();
  }
}
