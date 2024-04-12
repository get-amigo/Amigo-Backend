import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import PaymentSchema from './payment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BalanceService } from 'src/balance/balance.service';
import { ActivityFeedService } from 'src/activity-feed/activity-feed.service';
@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(PaymentSchema.name)
    private paymentModel: Model<{
      payer: string;
      receiver: string;
      amount: number;
      group: string;
    }>,
    private balanceService: BalanceService,
    private activityFeedService: ActivityFeedService,
  ) {}
  async create(createPaymentDto, creator) {
    const { payer, receiver, amount, group } = createPaymentDto;
    const transaction = {
      lender: payer,
      borrower: receiver,
      amount: parseInt(amount),
    };
    const payment = await this.paymentModel.create(createPaymentDto);
    this.activityFeedService.createActivity({
      activityType: 'payment',
      creator,
      group,
      relatedId: payment._id,
      onModel: 'Payment'
    });
    await this.balanceService.fetchAndMinimizeTransaction(group, [transaction]);
    return payment;
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
