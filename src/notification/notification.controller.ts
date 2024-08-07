import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateDeviceTokenDto, CreateNotificationDto } from './notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(@Body() notification: CreateNotificationDto) {
    await this.notificationService.sendNotification(notification);
    return { message: 'Notification sent successfully' };
  }

  @Post('device-token')
  async saveTokens(@Body() token: CreateDeviceTokenDto) {
    await this.notificationService.saveTokens(token);
    return { message: 'Tokens saved successfully' };
  }
}
