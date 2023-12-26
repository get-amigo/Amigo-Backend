import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import UserSchema from './users.schema';
import Twilio from 'twilio';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserSchema.name)
    private userModel: Model<typeof UserSchema>,
  ) {}

  async create(createUserBody) {
    const createdUser = new this.userModel(createUserBody);
    return createdUser.save();
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  async createUsersAndGetIds(phoneNumbers) {
    let userIds = [];
  
    for (let i = 0; i < phoneNumbers.length; i++) {
      let user = await this.findUserPhoneNumber(phoneNumbers[i].phoneNumber, phoneNumbers[i].countryCode);
  
      // If the user doesn't exist, create a new one
      if (!user) {
        const {phoneNumber,countryCode}=phoneNumbers[i];
        const newUser = new this.userModel({
          phoneNumber,
          countryCode
        });
  
        user = await newUser.save();
        this.sendSMS(phoneNumbers,countryCode,"Join our app");
      }
  
      userIds.push(user._id);
    }
  
    return userIds;
  }
  
  async sendSMS(phoneNumber,countryCode,message)
  {
    if(process.env.ENV=="production"){
      const client = Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      client.messages.create({
        body: message,  // Text of the SMS
        to: '+'+countryCode+phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER          // Replace with a valid Twilio number
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
