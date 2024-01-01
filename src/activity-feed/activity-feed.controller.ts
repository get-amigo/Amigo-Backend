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
  findAll() {
    return this.activityFeedService.findAll();
  }

  @Get(':groupId')
  findByGroup(
    @Param('groupId') groupId: string,
    @Query('pageNo') pageNo: number = 1, // Default page number is set to 1
    @Query('size') size: number = 10, // Default page size is set to 10
  ) {
    return this.activityFeedService.findByGroup(groupId, pageNo, size);
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
