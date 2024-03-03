import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import ActivityFeedSchema from './activity-feed.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityFeedDto } from './activity-feed-dto';
@WebSocketGateway()
@Injectable()
export class ActivityFeedService {
  @WebSocketServer() server;
  constructor(
    @InjectModel(ActivityFeedSchema.name)
    private activityModel: Model<ActivityFeedDto>,
  ) {}
  async createActivity(createActivityDto) {
    const newActivity = new this.activityModel(createActivityDto);
    const createdActivity = await newActivity.save();
    await this.populateActivity(createdActivity);
    this.server.emit('activity created', createdActivity);
  }

  async populateActivity(activity) {
    if (!activity.onModel) return;

    const populationOptions = {
      Transaction: {
        path: 'relatedId',
        model: 'Transaction',
        populate: [
          { path: 'paidBy', select: 'name phoneNumber countryCode' },
          { path: 'creator', select: 'name phoneNumber countryCode' },
          { path: 'splitAmong.user', select: 'name phoneNumber countryCode' },
        ],
      },
      Payment: {
        path: 'relatedId',
        model: 'Payment',
        populate: [
          { path: 'payer', select: 'name phoneNumber countryCode' },
          { path: 'receiver', select: 'name phoneNumber countryCode' },
        ],
      },
      Chat: {
        path: 'relatedId',
        model: 'Chat',
      },
    };

    const options = populationOptions[activity.onModel];
    if (options) {
      await this.activityModel.populate(activity, [
        options,
        { path: 'creator', select: 'name phoneNumber' },
      ]);
    }
  }

  async findByGroup(groupId, lastActivityTime, size) {
    let query = { group: groupId };
    if (typeof lastActivityTime === 'string' && !isNaN(Date.parse(lastActivityTime))) {
      query['createdAt'] = { $lt: new Date(lastActivityTime) };
    }

    let activities = await this.activityModel
      .find(query)
      .limit(size)
      .sort({ createdAt: -1 })
      .populate([
        {
          path: 'relatedId',
          populate: [
            {
              path: 'paidBy',
              select: 'name phoneNumber countryCode',
              strictPopulate: false,
            },
            {
              path: 'creator',
              select: 'name phoneNumber countryCode',
              strictPopulate: false,
            },
            {
              path: 'splitAmong.user',
              select: 'name phoneNumber countryCode',
              strictPopulate: false,
            },
            {
              path: 'payer',
              select: 'name phoneNumber countryCode',
              strictPopulate: false,
            },
            {
              path: 'receiver',
              select: 'name phoneNumber countryCode',
              strictPopulate: false,
            },
          ],
        },
        { path: 'creator', select: 'name phoneNumber' },
      ])
      .exec();

    return activities;
  }

  async findById(activityId) {
    let activity = await this.activityModel.findById(activityId).exec();

    await this.populateActivity(activity);

    return activity;
  }

  findAll() {
    return `This action returns all activityFeed`;
  }

  async deleteByRelationId(relatedId) {
    await this.activityModel.deleteOne({ relatedId });
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
