import { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ phoneNumber: 1, countryCode: 1 }, { unique: true });

export default { name: 'User', schema: UserSchema };
