import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import TransactionSchema from './transaction.schema';
import { BalanceService } from 'src/balance/balance.service';
import { BalanceModule } from 'src/balance/balance.module';
import BalanceSchema from 'src/balance/balance.schema';
@Module({
  imports: [
    BalanceModule,
    MongooseModule.forFeature([TransactionSchema, BalanceSchema]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, BalanceService],
})
export class TransactionModule {}
