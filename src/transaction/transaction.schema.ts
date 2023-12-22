import { Schema } from 'mongoose';

const TransactionSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  paidBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  splitAmong: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default { name: 'Transaction', schema: TransactionSchema };
