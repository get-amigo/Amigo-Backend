import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import TransactionSchema from './transaction.schema';
import { BalanceService } from 'src/balance/balance.service';
import { BalanceModule } from 'src/balance/balance.module';
import BalanceSchema from 'src/balance/balance.schema';
import ActivityFeedSchema from 'src/activity-feed/activity-feed.schema';
import { ActivityFeedService } from 'src/activity-feed/activity-feed.service';
@Module({
  imports: [
    BalanceModule,
    MongooseModule.forFeature([
      TransactionSchema,
      BalanceSchema,
      ActivityFeedSchema,
    ]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, BalanceService, ActivityFeedService],
})
export class TransactionModule {}
