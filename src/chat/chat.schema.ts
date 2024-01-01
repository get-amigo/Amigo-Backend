import { Schema } from 'mongoose';

const ChatSchema = new Schema(
  {
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
