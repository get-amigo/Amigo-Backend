import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import PaymentSchema from './payment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BalanceService } from 'src/balance/balance.service';
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
  ) {}
  async create(createPaymentDto) {
    const { payer, receiver, amount, group } = createPaymentDto;
    const transaction = {
      lender: payer,
      borrower: receiver,
      amount: amount,
    };
    this.balanceService.fetchAndMinimizeTransaction(group, [transaction]);
    return await this.paymentModel.create(createPaymentDto);
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
