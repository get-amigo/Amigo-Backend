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
    ]
  },
  {
    timestamps: true,
  },
);

export default { name: 'Group', schema: GroupSchema };
