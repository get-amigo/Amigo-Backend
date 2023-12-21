import { Schema } from 'mongoose';

const addressSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        'Registered Office',
        'Corporate Office',
        'Branch Office',
        'Site Office',
        'Client Office',
        'Head Office',
      ],
    },
    line1: {
      type: String,
      required: true,
    },
    line2: {
      type: String,
      required: true,
    },
    contry: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
      RegExp: /^\d{6}$/,
    },
  },
  {
    timestamps: true,
  },
);

export default { name: 'Address', schema: addressSchema };
