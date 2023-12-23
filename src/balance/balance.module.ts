import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import BalanceSchema from './balance.schema';

@Module({
  imports: [MongooseModule.forFeature([BalanceSchema])],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}
