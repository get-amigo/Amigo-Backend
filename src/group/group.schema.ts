import { Schema } from 'mongoose';

const GroupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default { name: 'Group', schema: GroupSchema };
