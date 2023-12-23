import { Schema } from 'mongoose';

const BalanceSchema = new Schema(
  {
    lender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    borrower: {
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
    }
  },
  { timestamps: true },
);

export default { name: 'Balance', schema: BalanceSchema };
