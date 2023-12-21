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
    },
    // You can add more fields as necessary for your application
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields automatically
  },
);

export default { name: 'Group', schema: GroupSchema };
