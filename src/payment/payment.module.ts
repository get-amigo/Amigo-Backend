import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import PaymentSchema from './payment.schema';
import { BalanceService } from 'src/balance/balance.service';
import { BalanceModule } from 'src/balance/balance.module';
import BalanceSchema from 'src/balance/balance.schema';

@Module({
  imports: [
    BalanceModule,
    MongooseModule.forFeature([PaymentSchema, BalanceSchema]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, BalanceService],
})
export class PaymentModule {}
