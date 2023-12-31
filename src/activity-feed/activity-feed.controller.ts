import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActivityFeedService } from './activity-feed.service';

@Controller('activity-feed')
export class ActivityFeedController {
  constructor(private readonly activityFeedService: ActivityFeedService) {}

  
  @Get()
  findAll() {
    return this.activityFeedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityFeedService.findOne(+id);
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
