import { Module, forwardRef } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import TransactionSchema from './transaction.schema';
import { BalanceService } from 'src/balance/balance.service';
import { BalanceModule } from 'src/balance/balance.module';
import BalanceSchema from 'src/balance/balance.schema';
import GroupBalanceSchema from 'src/balance/groupBalance.schema';
import { ActivityFeedService } from 'src/activity-feed/activity-feed.service';
import ActivityFeedSchema from 'src/activity-feed/activity-feed.schema';
import { GroupModule } from 'src/group/group.module';
@Module({
  imports: [
    BalanceModule,
    forwardRef(() => GroupModule),
    MongooseModule.forFeature([
      TransactionSchema,
      BalanceSchema,
      ActivityFeedSchema,
      GroupBalanceSchema,
    ]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, BalanceService, ActivityFeedService],
})
export class TransactionModule {}
