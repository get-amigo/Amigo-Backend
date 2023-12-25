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
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default { name: 'User', schema: UserSchema };
