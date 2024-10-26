import { Controller, Post, Body, Req, UnauthorizedException, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { DeviceTokenDto, CreateNotificationDto } from './notification.dto';
import { verifyNotificationQueuePayload } from 'src/utils/queue';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Post()
  async send(@Req() req: Request, @Body() notification: CreateNotificationDto) {
    if (!req.headers['upstash-signature']) {
      throw new UnauthorizedException('Unauthorized');
    }

    const isValid = await verifyNotificationQueuePayload({
      signature: req.headers['upstash-signature'],
      body: JSON.stringify(notification)
    });

    if (!isValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.notificationService.sendNotification(notification);

    return { message: 'Notification sent successfully' };
  }

  @Post('device-token')
  async saveTokens(@Body() token: DeviceTokenDto) {
    await this.notificationService.saveTokens(token);
    return { message: 'Tokens saved successfully' };
  }

  @Delete('device-token')
  async deleteToken(@Body() token: DeviceTokenDto) {
    await this.notificationService.deleteToken(token);
    return { message: 'Token deleted successfully' };
  }
}
