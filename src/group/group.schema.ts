import { Schema } from 'mongoose';

const MemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  }
});

const GroupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    members: [MemberSchema]
  },
  {
    timestamps: true,
  },
);

export default { name: 'Group', schema: GroupSchema };
