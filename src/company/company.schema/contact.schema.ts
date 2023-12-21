import { Schema } from 'mongoose';
import companySchema from '.';

const contactSchema = new Schema(
  {
    title: {
      type: String,
      enum: ['Mr', 'Mrs', 'Miss', 'Ms'],
      validate: {
        validator: function () {
          return (
            (this.company != null &&
              this.designation != null &&
              this.name != null &&
              this.title != null) ||
            (this.company == null &&
              this.designation == null &&
              this.name == null &&
              this.title == null)
          );
        },
        message: 'Contact details of company should be there',
      },
    },
    name: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: /^\d{10}$/,
    },
    email: {
      type: String,
      required: true,
      match: /\S+@\S+\.\S+/,
    },
    designation: {
      type: String,
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

export default { name: 'Contact', schema: contactSchema };
