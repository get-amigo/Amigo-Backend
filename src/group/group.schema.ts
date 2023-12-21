import { Schema } from 'mongoose';

const GroupSchema = new Schema(
  {
    groupName: {
      type: String,
      required: true,
      unique: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    description: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  },
);

export default { name: 'Group', schema: GroupSchema };
