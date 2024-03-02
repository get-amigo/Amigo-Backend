import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import ActivityFeedSchema from './activity-feed.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  getPopulationObject(activityType) {
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
    return populationOptions[activityType];
  }

  async populateActivity(activity) {
    if (!activity.onModel) return;

    const options = this.getPopulationObject(activity.onModel);
    if (options) {
      await this.activityModel.populate(activity, [
        options,
        { path: 'creator', select: 'name phoneNumber' },
      ]);
    }
  }

  async findByGroup(groupId, lastActivityTime, size) {
    let matchStage = {
      $match: { group: new Types.ObjectId(groupId) }
  };

  if (lastActivityTime) {
      matchStage.$match["createdAt"] = { $lt: new Date(lastActivityTime) };
  }

  let limitStage = { $limit: size };

    
    let activities = await this.activityModel.aggregate([
      matchStage,
      { $sort: { createdAt: -1 } },
      limitStage,
      {
        $facet: {
          branch1: [
            {
              $match: { onModel: "Transaction" } 
            },{
              $lookup: {
                from: "transactions",
                localField: "relatedId",
                foreignField: "_id",
                as: "transaction"
              },
              
            },
            {
              $unwind: "$transaction"
            },
            {
              $lookup: {
                from: "users", 
                localField: "transaction.creator",
                foreignField: "_id",
                as: "transaction.creator"
              }
            },
            {
              $unwind: "$transaction.creator"
            },
            {
              $lookup: {
                from: "users", 
                localField: "transaction.paidBy",
                foreignField: "_id",
                as: "transaction.paidBy"
              }
            },
            {
              $unwind: "$transaction.paidBy"
            },
            {
              $lookup: {
                from: "users",
                localField: "transaction.splitAmong.user",
                foreignField: "_id",
                as: "splitUsers"
              }
            },
            {
              $addFields: {
                "transaction.splitAmong": {
                  $map: {
                    input: "$transaction.splitAmong",
                    as: "split",
                    in: {
                      $mergeObjects: [
                        "$$split",
                        {
                          user: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$splitUsers",
                                  as: "user",
                                  cond: { $eq: ["$$user._id", "$$split.user"] }
                                }
                              },
                              0
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              }
            },
          ],
          branch2: [
            {
              $match: { onModel: "Payment" } 
            },
            {
              $lookup: {
                from: "payments",
                let: { activityId: "$relatedId" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$activityId"] } } },
                  { $set: this.getPopulationObject("Payment") },
                ],
                as: "populatedPayments"
              }
            }
          ],
          branch3: [
            {
              $match: { onModel: "Chat" } 
            },
            {
              $lookup: {
                from: "chats",
                let: { activityId: "$relatedId" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$activityId"] } } },
                  { $set:this.getPopulationObject("Chat") },
                ],
                as: "populatedChats"
              }
            }
          ],
        }
      }
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
