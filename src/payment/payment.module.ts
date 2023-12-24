import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import PaymentSchema from './payment.schema';

@Module({
  imports: [MongooseModule.forFeature([PaymentSchema])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
