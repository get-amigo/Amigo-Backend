import { Schema } from 'mongoose';

const NotificationSchema = new Schema({
    data: { type: Object, required: true },
    type: { type: String, required: true, enum: ['TRANSACTION_ADD', 'PAYMENT_SETTLED', 'GROUP_JOINED', 'CHAT_MESSAGE'] },
}, { timestamps: true });

const DeviceTokenSchema = new Schema({
    token: { type: String, required: true },
    platform: { type: String, required: true, enum: ['ANDROID', 'IOS'] },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Notification = { name: 'Notification', schema: NotificationSchema };
const DeviceToken = { name: 'DeviceToken', schema: DeviceTokenSchema };

export { Notification as NotificationSchema, DeviceToken as DeviceTokenSchema };
