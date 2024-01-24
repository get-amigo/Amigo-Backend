import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import BalanceSchema from './balance.schema';
import GroupBalanceSchema from './groupBalance.schema';

@Module({
  imports: [MongooseModule.forFeature([BalanceSchema,GroupBalanceSchema])],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}
