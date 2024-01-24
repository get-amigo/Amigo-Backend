import { Schema } from 'mongoose';

const GroupBalanceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
  },
  { timestamps: true },
);

export default { name: 'Group Balance', schema: GroupBalanceSchema };
