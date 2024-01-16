import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import GroupSchema from './group.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TransactionService } from 'src/transaction/transaction.service';
import { UsersService } from 'src/users/users.service';
import { ChatService } from 'src/chat/chat.service';
import { ActivityFeedService } from 'src/activity-feed/activity-feed.service';
@Injectable()
export class GroupService {
  constructor(
    @InjectModel(GroupSchema.name)
    private groupModel: Model<{ name: string; members: [string] }>,
    private transactionService: TransactionService,
    private userService: UsersService,
    private chatService: ChatService,
    private activityFeedService: ActivityFeedService,
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

  createChat(message, group, creator) {
    const chat = this.chatService.create(message);
    return this.activityFeedService.createActivity({
      activityType: 'chat',
      creator,
      group,
      relatedId: chat._id,
      onModel: 'Chat',
    });
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
    return await this.groupModel.updateMany(groupId, { name: groupName });
  }

  async joinGroup(groupId, userId) {
    const group = await this.groupModel.findById(groupId).exec();

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const { members } = group;
    // Check if the user is already a member of the group
    if (members.includes(userId)) {
      throw new BadRequestException('User already a member of the group');
    }

    // Add the user to the group's members array
    members.push(userId);

    // Save the updated group
    await group.save();

    return group; // Or some other meaningful response
  }

  async getAllUserGroups(userId) {
    try {
      // Find all groups where the userId is in the members array and populate the 'members' field
      const userGroups = await this.groupModel
        .find({ members: { $in: [userId] } })
        .populate('members', 'name phoneNumber countryCode') // Populate the 'members' field and select the 'name' field
        .exec();

      // Return the list of groups with the names of their members
      return userGroups;
    } catch (error) {
      // Handle any errors that occur during the database query
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

  async getAllTransactions(groupId) {
    return this.transactionService.getTransactionsByGroupId(groupId);
  }
}
