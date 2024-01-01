import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import ActivityFeedSchema from './activity-feed.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityFeedDto } from './activity-feed-dto';
@Injectable()
export class ActivityFeedService {
  @WebSocketServer() server;
  constructor(
    @InjectModel(ActivityFeedSchema.name)
    private activityModel: Model<ActivityFeedDto>,
  ) {}
  createActivity(createActivityDto)
  {
    const newActivity = new this.activityModel(createActivityDto);
    newActivity.save();
  }

  async findByGroup(groupId, lastActivityTime, size) {
    let query = { group: groupId };
    if (lastActivityTime) {
      query["createdAt"] = { $lt: new Date(lastActivityTime) };
    }
  
    let activities = await this.activityModel
      .find(query)
      .limit(size)
      .sort({ createdAt: -1 }) // Sorting by creation time in descending order
      .exec();
  
  
    for (let activity of activities) {
      if (activity.onModel) {
        await this.activityModel.populate(activity, {
          path: 'relatedId',
          model: activity.onModel
        });
      }
    }
    return activities;
  }
  
  
  
  

  findAll() {
    return `This action returns all activityFeed`;
  }

  findOne(id: number) {
    return `This action returns a #${id} activityFeed`;
  }

  update(id: number, updateActivityFeedDto) {
    return `This action updates a #${id} activityFeed`;
  }

  remove(id: number) {
    return `This action removes a #${id} activityFeed`;
  }
}
