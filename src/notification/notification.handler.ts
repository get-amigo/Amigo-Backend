import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import GroupSchema from 'src/group/group.schema';
import UsersSchema from 'src/users/users.schema';

@Injectable()
export class NotificationHandler {
  constructor(
    @InjectModel(GroupSchema.name) private readonly groupModel: Model<{ name: string, members: Types.ObjectId[] }>,
    @InjectModel(UsersSchema.name) private readonly userModel: Model<{ name: string, phoneNumber: string }>,
  ) {}

  getHandler(type) {
    const handlers = {
      TRANSACTION_ADD: this.handleTransactionAdd.bind(this),
      CHAT_MESSAGE: this.handleChatMessage.bind(this),
      GROUP_JOINED: this.handleGroupJoined.bind(this),
      PAYMENT_SETTLED: this.handlePaymentSettled.bind(this),
    };

    return handlers[type];
  }

  private async handleTransactionAdd(data, getTokens) {
    const userIds = data.splitAmong.map(({ user }) => user).filter((userId) => userId !== data.creator);

    const [groupDetails, creatorDetails, tokens] = await Promise.all([
      this.groupModel.findById(data.group, { name: 1 }),
      this.userModel.findById(data.creator, { name: 1, phoneNumber: 1 }),
      getTokens(userIds),
    ]);

    return {
      tokens,
      data: JSON.stringify({
        ...data,
        creator: creatorDetails,
        group: groupDetails,
      }),
    };
  }

  private async handleChatMessage(data, getTokens) {
    const groupDetails = await this.groupModel.findById(data.group, { name: 1, members: 1 });

    const userIds = groupDetails.members
      .filter((userId) => userId.toString() !== data.creator)
      .map((userId) => userId.toString());

    const [creatorDetails, tokens] = await Promise.all([
      this.userModel.findById(data.creator, { name: 1, phoneNumber: 1 }),
      getTokens(userIds),
    ]);

    return {
      tokens,
      data: JSON.stringify({
        ...data,
        creator: creatorDetails,
        group: groupDetails,
      }),
    };
  }

  private async handleGroupJoined(data, getTokens) {
    const invitee = data.invitee;
    const newMembers = data.newMembers
    const userIds = data.group.members.filter((userId)=> { if(invitee!==userId){ return userId}});

    const [inviteeDetails,newMembersDetail,tokens] = await Promise.all([
      this.userModel.findById(data.invitee, { name: 1, phoneNumber: 1 }),
      this.userModel.find({
        '_id':{
          $in:newMembers,
        }
      },{name:1,phoneNumber:1}),
      getTokens(userIds),
    ]);

    return {
      tokens,
      data: JSON.stringify({
        group: data.group,
        invitee: inviteeDetails,
        newMembers:newMembersDetail
      }),
    };
  }

  private async handlePaymentSettled(data, getTokens) {
    const groupDetails = await this.groupModel.findById(data.group, { name: 1, members: 1 });
    
    const userIds = groupDetails.members
      .filter((userId) => userId.toString() !== data.payer)
      .map((userId) => userId.toString());

    const [payerDetails, tokens] = await Promise.all([
      this.userModel.findById(data.payer, { name: 1, phoneNumber: 1 }),
      getTokens(userIds),
    ]);

    return {
      tokens,
      data: JSON.stringify({
        ...data,
        payer: payerDetails,
        group: groupDetails,
      }),
    };
  }
}
