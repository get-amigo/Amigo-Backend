import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import UserSchema from './users.schema';
import Twilio from 'twilio';
import GroupSchema from 'src/group/group.schema';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserSchema.name)
    private userModel: Model<typeof UserSchema>,
    @InjectModel(GroupSchema.name)
    private groupModel:Model<typeof GroupSchema>,
  ) {}

  async create(createUserBody) {
    const createdUser = new this.userModel(createUserBody);
    return createdUser.save();
  }

  editUser(id, newUser) {
    return this.userModel.findByIdAndUpdate(id, newUser).exec();
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  async findOrCreateUser(phoneNumber, countryCode) {
    // Find user by phone number and country code
    let user = await this.findUserPhoneNumber(phoneNumber, countryCode);

    // If user doesn't exist, create a new user
    if (!user) {
      user = await this.create({
        phoneNumber,
        countryCode,
      });
    }

    return user;
  }

  async exitAllGroups(userId) {
    return await this.groupModel.updateMany(
      { members: userId },
      { $pull: { members: userId } },
    );
  }


  async deleteUser(userId) {
    const exitedGroups = await this.exitAllGroups(userId);
    return await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          phoneNumber: null,
          countryCode: null,
          name: null,
          deletedAt: new Date(), 
        }
      }
    );
  }
  

  async createUsersAndGetIds(phoneNumbers) {
    let userIds = [];

    for (let i = 0; i < phoneNumbers.length; i++) {
      let user = await this.findUserPhoneNumber(
        phoneNumbers[i].phoneNumber,
        phoneNumbers[i].countryCode,
      );

      // If the user doesn't exist, create a new one
      if (!user) {
        const { phoneNumber, countryCode } = phoneNumbers[i];
        const newUser = new this.userModel({
          phoneNumber,
          countryCode,
        });

        user = await newUser.save();
        this.sendSMS(phoneNumbers, countryCode, 'Join our app');
      }

      userIds.push(user._id);
    }

    return userIds;
  }

  async createUsersAndGetUsers(phoneNumbers) {
    let users = [];

    for (let i = 0; i < phoneNumbers.length; i++) {
      let user = await this.findUserPhoneNumber(
        phoneNumbers[i].phoneNumber,
        phoneNumbers[i].countryCode,
      );

      // If the user doesn't exist, create a new one
      if (!user) {
        const { phoneNumber, countryCode } = phoneNumbers[i];
        const newUser = new this.userModel({
          phoneNumber,
          countryCode,
        });

        user = await newUser.save();
        this.sendSMS(phoneNumbers, countryCode, 'Join our app');
      }

      users.push(user);
    }

    return users;
  }

  async sendSMS(phoneNumber, countryCode, message) {
    if (process.env.ENV == 'production') {
      const client = Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      client.messages.create({
        body: message, // Text of the SMS
        to: '+' + countryCode + phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER, // Replace with a valid Twilio number
      });
    }
  }

  async findById(id) {
    return await this.userModel.findById(id).exec();
  }

  async findUserPhoneNumber(phoneNumber, countryCode) {
    return await this.userModel.findOne({ phoneNumber, countryCode }).exec();
  }

  async editName(id, name) {
    return await this.userModel.findByIdAndUpdate(id, { name: name }).exec();
  }
}
