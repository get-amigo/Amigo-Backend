import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ActivityFeedService } from './activity-feed.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(new JwtAuthGuard('jwt'))
@Controller('activity-feed')
export class ActivityFeedController {
  constructor(private readonly activityFeedService: ActivityFeedService) {}

  @Get()
  findByGroup(
    @Query('groupId') groupId: string,
    @Query('lastActivityTime') lastActivityTime: string, // Receive last activity time
    @Query('size') size: number = 10, // Default page size is set to 10
  ) {
    return this.activityFeedService.findByGroup(
      groupId,
      lastActivityTime,
      size,
    );
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.activityFeedService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivityFeedDto) {
    return this.activityFeedService.update(+id, updateActivityFeedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityFeedService.remove(+id);
  }
}
