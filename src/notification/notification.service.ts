import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';

import { sendPushNotification } from 'src/utils/firebase';
import DeviceTokenSchema from './device-token.schema';
import { CreateNotificationDto, DeviceTokenDto } from './notification.dto';
import { NotificationHandler } from './notification.handler';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(DeviceTokenSchema.name) private readonly deviceTokenModel: Model<DeviceTokenDto>,
    private readonly notificationHandler: NotificationHandler,
  ) {}

  async getTokens(userIds: string[]) {
    const tokens = await this.deviceTokenModel.find({ userId: { $in: userIds } }).exec();
    return tokens.map(({ token }) => token);
  }

  async saveTokens(createDeviceTokenDto: DeviceTokenDto) {
    const { token, deviceId } = createDeviceTokenDto;
    const existingDeviceToken = await this.deviceTokenModel.findOne({ deviceId }).exec();

    if (existingDeviceToken && existingDeviceToken.token !== token) {
      existingDeviceToken.token = token;
      await existingDeviceToken.save();
    } else {
      const createdDeviceToken = new this.deviceTokenModel(createDeviceTokenDto);
      await createdDeviceToken.save();
    }
  }

  async sendNotification(createNotificationDto: CreateNotificationDto): Promise<void> {
    const { data, type } = createNotificationDto;
    
    const handler = this.notificationHandler.getHandler(type);
    const { tokens, data: payload } = await handler(data, this.getTokens.bind(this));

    const message: admin.messaging.MulticastMessage = {
      data: {
        type, 
        data: payload,
      },
      tokens,
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            content_available: true,
          },
        },
      },
    };

    try {
      await sendPushNotification(message);
    } catch (error) {
      console.log("error", error)
    }
  }

  async deleteToken(deviceTokenDto: DeviceTokenDto) {
    await this.deviceTokenModel.deleteOne({ token: deviceTokenDto.token }).exec();
  }
}
