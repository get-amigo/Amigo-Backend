import { Schema } from 'mongoose';

const BalanceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  amountOwed: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

export default { name: 'Balance', schema: BalanceSchema };
