import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import ActivityFeedSchema from './activity-feed.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class ActivityFeedService {
  @WebSocketServer() server;
  constructor(
    @InjectModel(ActivityFeedSchema.name)
    private balanceModel: Model<typeof ActivityFeedSchema>,
  ) {}
  createActivity()
  {

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
