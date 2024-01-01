import { Schema } from 'mongoose';

const TransactionSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    type: { type: String, required: true },
    splitAmong: [
      {
        _id: false,
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        amount: Number,
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

export default { name: 'Transaction', schema: TransactionSchema };
