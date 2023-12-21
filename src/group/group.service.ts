import { Injectable } from '@nestjs/common';
import GroupSchema from './group.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class GroupService {
  constructor(
    @InjectModel(GroupSchema.name)
    private groupModel: Model<typeof GroupSchema>,
  ) {}
  create(createGroupDto) {
    const createdGroup = new this.groupModel(createGroupDto);
    return createdGroup.save();
  }

  findAll() {
    return `This action returns all group`;
  }

  findOne(id: number) {
    return `This action returns a #${id} group`;
  }

  update(id: number, updateGroupDto) {
    return `This action updates a #${id} group`;
  }

  remove(id: number) {
    return `This action removes a #${id} group`;
  }
}
