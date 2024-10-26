export class CreateNotificationDto {
  readonly data: Record<string, any>;
  readonly type:
    | 'TRANSACTION_ADD'
    | 'PAYMENT_SETTLED'
    | 'GROUP_JOINED'
    | 'CHAT_MESSAGE';
}

export class DeviceTokenDto {
  token: string;
  readonly platform: 'ANDROID' | 'IOS';
  readonly userId: string;
  readonly deviceId: string;
}
