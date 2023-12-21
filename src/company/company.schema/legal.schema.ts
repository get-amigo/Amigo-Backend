import { Schema } from 'mongoose';
import addressSchema from './address.schema';

const legalSchema = new Schema(
  {
    companyType: {
      type: String,
      required: true,
      enum: [
        'Sole Proprietorship',
        'Private Limited',
        'Public Limited',
        'Partnership Firm',
        'Not-For-Profit Organisation',
        'One Person Company',
        'Limited Liability Partnership',
      ],
    },
    registrationNumber: {
      type: String,
      required: true,
    },
    yearOfRegistration: {
      type: Number,
      required: true,
    },
    tin: {
      type: String,
      required: true,
    },
    lastFinancialYearTurnover: {
      type: Number,
      required: true,
    },
    registrationAddress: {
      type: Schema.Types.ObjectId,
      ref: addressSchema.name,
    },
  },
  {
    timestamps: true,
  },
);

export default { name: 'Legal', schema: legalSchema };
