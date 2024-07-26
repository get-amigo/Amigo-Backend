import { Schema, Types } from 'mongoose';

const ChatSchema = new Schema(
  {
    _id: {
      type: Types.ObjectId,
      required: false,
      auto: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default { name: 'Chat', schema: ChatSchema };
