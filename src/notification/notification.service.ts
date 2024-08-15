import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';

import DeviceTokenSchema from './device-token.schema';
import { CreateNotificationDto, DeviceTokenDto } from './notification.dto';
import { sendPushNotification } from 'src/utils/firebase';
import GroupSchema from 'src/group/group.schema';
import UsersSchema from 'src/users/users.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(DeviceTokenSchema.name) private readonly deviceTokenModel: Model<DeviceTokenDto>,
    @InjectModel(GroupSchema.name) private readonly groupModel: Model<{ name: string }>,
    @InjectModel(UsersSchema.name) private readonly userModel: Model<{ name: string }>,
  ) {}

  async getTokens(userIds: string[]) {
    const tokens = await this.deviceTokenModel.find({ userId: { $in: userIds } }).exec();
    return tokens.map(({ token }) => token);
  }

  async saveTokens(createDeviceTokenDto: DeviceTokenDto) {
    const createdDeviceToken = new this.deviceTokenModel(createDeviceTokenDto);
    await createdDeviceToken.save();
  }

  async sendNotification(createNotificationDto: CreateNotificationDto): Promise<void> {
    const { data, type } = createNotificationDto;
    
    //!! STAGE 1: Implement TRANSACTION_ADD push notification

    // Transaction creator should not receive a push notification
    const userIds = data.splitAmong.map(({ user }) => user).filter((userId) => userId !== data.creator);

    const [groupDetails, creatorDetails, tokens] = await Promise.all([
      this.groupModel.findById(data.group, { name: 1 }),
      this.userModel.findById(data.creator, { name: 1 }),
      this.getTokens(userIds),
    ]);

    const message: admin.messaging.MulticastMessage = {
      data: {
        type, 
        data: JSON.stringify({
          ...data,
          creator: creatorDetails,
          group: groupDetails,
        })
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
