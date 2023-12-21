import { Schema } from 'mongoose';
import addressSchema from './address.schema';
import companySchema from '.';
import contactSchema from './contact.schema';
const officeSchema = new Schema(
  {
    address: {
      type: Schema.Types.ObjectId,
      ref: addressSchema.name,
    },
    contact: {
      type: Schema.Types.ObjectId,
      ref: contactSchema.name,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: companySchema.name,
    },
  },
  {
    timestamps: true,
  },
);

export default { name: 'Office', schema: officeSchema };
