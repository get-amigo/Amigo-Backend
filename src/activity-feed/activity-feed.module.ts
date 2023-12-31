import { Module } from '@nestjs/common';
import { ActivityFeedService } from './activity-feed.service';
import { ActivityFeedController } from './activity-feed.controller';
import { MongooseModule } from '@nestjs/mongoose';
import ActivityFeedSchema from './activity-feed.schema';
@Module({
  imports: [MongooseModule.forFeature([ActivityFeedSchema])],
  controllers: [ActivityFeedController],
  providers: [ActivityFeedService],
})
export class ActivityFeedModule {}
