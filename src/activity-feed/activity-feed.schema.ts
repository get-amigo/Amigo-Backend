import { Schema } from 'mongoose';

const ActivityFeedSchema = new Schema(
  {
    activityType: {
      type: String,
      required: true,
      enum: ['transaction', 'payment', 'chat', 'groupJoin'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: false,
      refPath: 'onModel',
    },
    onModel: {
      type: String,
      required: false,
      enum: ['Transaction', 'Payment', 'Chat'],
    },
    description: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  },
);

export default { name: 'ActivityFeed', schema: ActivityFeedSchema };
