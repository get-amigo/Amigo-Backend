import { Injectable } from '@nestjs/common';
import { CreateActivityFeedDto } from './dto/create-activity-feed.dto';
import { UpdateActivityFeedDto } from './dto/update-activity-feed.dto';

@Injectable()
export class ActivityFeedService {
  create(createActivityFeedDto: CreateActivityFeedDto) {
    return 'This action adds a new activityFeed';
  }

  findAll() {
    return `This action returns all activityFeed`;
  }

  findOne(id: number) {
    return `This action returns a #${id} activityFeed`;
  }

  update(id: number, updateActivityFeedDto: UpdateActivityFeedDto) {
    return `This action updates a #${id} activityFeed`;
  }

  remove(id: number) {
    return `This action removes a #${id} activityFeed`;
  }
}
