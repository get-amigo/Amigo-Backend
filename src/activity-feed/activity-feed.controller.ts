import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActivityFeedService } from './activity-feed.service';
import { CreateActivityFeedDto } from './dto/create-activity-feed.dto';
import { UpdateActivityFeedDto } from './dto/update-activity-feed.dto';

@Controller('activity-feed')
export class ActivityFeedController {
  constructor(private readonly activityFeedService: ActivityFeedService) {}

  @Post()
  create(@Body() createActivityFeedDto: CreateActivityFeedDto) {
    return this.activityFeedService.create(createActivityFeedDto);
  }

  @Get()
  findAll() {
    return this.activityFeedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityFeedService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivityFeedDto: UpdateActivityFeedDto) {
    return this.activityFeedService.update(+id, updateActivityFeedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityFeedService.remove(+id);
  }
}
