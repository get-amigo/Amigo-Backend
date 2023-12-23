import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import GroupSchema from './group.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
@Injectable()
export class GroupService {
  constructor(
    @InjectModel(GroupSchema.name)
    private groupModel: Model<{ name: string; members: [string] }>,
  ) {}
  create(createGroupDto) {
    const createdGroup = new this.groupModel(createGroupDto);
    return createdGroup.save();
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
    // Find all groups where the userId is in the members array
    const userGroups = await this.groupModel.find({ members: { $in: [userId] } }).exec();
  
    if (!userGroups || userGroups.length === 0) {
      throw new NotFoundException('No groups found for this user');
    }
  
    return userGroups; // Return the list of groups
  }
  
}
