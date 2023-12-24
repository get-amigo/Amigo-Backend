import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { MongooseModule } from '@nestjs/mongoose';
import GroupSchema from './group.schema';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import TransactionSchema from 'src/transaction/transaction.schema';
import { BalanceModule } from 'src/balance/balance.module';
import { BalanceService } from 'src/balance/balance.service';
import BalanceSchema from 'src/balance/balance.schema';

@Module({
  imports: [
    TransactionModule,
    BalanceModule,
    MongooseModule.forFeature([GroupSchema, TransactionSchema, BalanceSchema]),
  ],
  controllers: [GroupController],
  providers: [GroupService, TransactionService, BalanceService],
})
export class GroupModule {}
