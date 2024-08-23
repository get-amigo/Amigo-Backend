import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import GroupSchema from './group.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { TransactionService } from 'src/transaction/transaction.service';
import { UsersService } from 'src/users/users.service';
import { ChatService } from 'src/chat/chat.service';
import { ActivityFeedService } from 'src/activity-feed/activity-feed.service';
import { JwtService } from '@nestjs/jwt';
import { decrypt, encrypt } from 'src/utils/cipher';
@Injectable()
export class GroupService {
  constructor(
    @InjectModel(GroupSchema.name)
    private groupModel: Model<{ name: string; members: string[] }>,
    private transactionService: TransactionService,
    private userService: UsersService,
    private chatService: ChatService,
    private activityFeedService: ActivityFeedService,
    private jwtService: JwtService
  ) {}
  async create(createGroupDto) {
    const { members, name, phoneNumbers } = createGroupDto;
    const newMemberIds =
      await this.userService.createUsersAndGetIds(phoneNumbers);

    const allMemberIds = members
      .map((id) => id.toString())
      .concat(newMemberIds.map((id) => id.toString()));
    const uniqueMemberIdStrings = [...new Set(allMemberIds)];
    const uniqueMemberIds = uniqueMemberIdStrings.map(
      (idString: string) => new Types.ObjectId(idString),
    );

    const createdGroup = new this.groupModel({
      members: uniqueMemberIds,
      name,
    });

    return createdGroup.save();
  }

  async createChat(message, group, creator, activityId, chatId) {
    const chat = await this.chatService.create(message, chatId);
    return this.activityFeedService.createActivity({
      _id:activityId,
      activityType: 'chat',
      creator,
      group,
      relatedId: chat._id,
      onModel: 'Chat',
    });
  }

  async leaveGroup(userId, groupId) {
    // Find the group
    const group = await this.groupModel.findById(groupId).exec();

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if the user is a member of the group
    const isMember = group.members.includes(userId.toString());

    if (!isMember) {
      throw new NotFoundException('User is not a member of the group');
    }

    group.members = group.members.filter((id) => id != userId.toString());

    // Save the updated group
    await group.save();

    return group; // Or some other meaningful response
  }

  async addMembers(groupId, phoneNumbers) {
    // Find the group
    const group = await this.groupModel.findById(groupId).exec();

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Create users based on phone numbers and get their IDs
    const newMemberIds =
      await this.userService.createUsersAndGetIds(phoneNumbers);

    // Filter out existing members from the new users
    const nonExistingMembers = newMemberIds.filter(
      (id) => !group.members.includes(id.toString()),
    );

    // If all users are existing members, you can simply return the group without making any changes
    if (nonExistingMembers.length === 0) {
      return group;
    }

    // Add the new users to the group's members array
    const newMemberObjectIds = nonExistingMembers.map(
      (id) => new Types.ObjectId(id),
    );
    group.members.push(
      ...newMemberObjectIds.map((objectId) => objectId.toString()),
    );

    // Save the updated group
    await group.save();

    return group; // Or some other meaningful response
  }

  async editGroupName(groupId, groupName) {
    return await this.groupModel.updateOne(
      { _id: groupId },
      { $set: { name: groupName } },
    );
  }

  async joinGroup(hashedGroupId, userId) {
    const decodedGroupId = this.jwtService.verify(hashedGroupId);
    const groupId = decrypt(decodedGroupId.groupId);

    const group = await this.groupModel.findById(groupId).exec();

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const { members } = group;

    if (members.includes(userId)) {
      throw new BadRequestException('User already a member of the group');
    }

    members.push(userId);

    const [, memberDetails] = await Promise.all([
      group.save(),
      this.userService.findUsersByIds(members),
    ]);

    return {
      ...group.toObject(),
      members: memberDetails,
    };
  }

  async getAllUserGroups(userId) {
    try {
      const userGroups = await this.groupModel
        .aggregate([
          {
            $match: {
              members: new Types.ObjectId(userId),
            },
          },
          {
            $lookup: {
              from: 'activity',
              localField: '_id',
              foreignField: 'groupId',
              as: 'activities',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'members',
              foreignField: '_id',
              as: 'members',
            },
          },
          {
            $project: {
              _id: 1,
              createdAt: 1,
              groupIds: ['$_id'], // Wrap _id in an array
              name: 1,
              members: {
                $map: {
                  input: '$members',
                  as: 'member',
                  in: {
                    _id: '$$member._id',
                    name: '$$member.name',
                    phoneNumber: '$$member.phoneNumber',
                    countryCode: '$$member.countryCode',
                  },
                },
              },
              activities: 1,
            },
          },
          {
            $lookup: {
              from: 'activityfeeds',
              let: { group_ids: '$groupIds' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$group', '$$group_ids'],
                    },
                  },
                },
                {
                  $sort: {
                    createdAt: -1,
                  },
                },
                {
                  $group: {
                    _id: '$group',
                    latestActivity: { $first: '$$ROOT' },
                  },
                },
              ],
              as: 'groupActivities',
            },
          },
          {
            $project: {
              _id: 1,
              createdAt: 1,
              groupIds: 1,
              name: 1,
              members: 1,
              activities: 1,
              latestActivity: {
                $arrayElemAt: ['$groupActivities.latestActivity', 0],
              },
            },
          },
          {
            $sort: {
              'latestActivity.createdAt': -1,
              createdAt: -1,
            },
          },
        ])
        .exec();
        

      return userGroups;
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

  async getAllTransactions(groupId) {
    return this.transactionService.getTransactionsByGroupId(groupId);
  }

  async generateToken(groupId){
    const group = await this.groupModel.findById(groupId).populate('members').exec();
    if (!group) {
      throw new Error('Group not found');
    }
    
    const hashedGroupId = encrypt(groupId);
    

    const payload = { 
      groupId:hashedGroupId, 
      name: group.name,
      memberCount: group.members.length 
    };
  
    return this.jwtService.sign(payload)
  }


}
