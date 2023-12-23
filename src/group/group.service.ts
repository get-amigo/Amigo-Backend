import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import GroupSchema from './group.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
}
