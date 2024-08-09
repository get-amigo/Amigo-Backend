import { Schema } from 'mongoose';

const DeviceTokenSchema = new Schema({
    token: { type: String, required: true },
    platform: { type: String, required: true, enum: ['ANDROID', 'IOS'] },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default { name: 'DeviceToken', schema: DeviceTokenSchema };
