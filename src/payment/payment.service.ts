import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import PaymentSchema from './payment.schema';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(PaymentSchema.name)
    private paymentModel: Model<{payer:string,receiver:string,amount:number,group:string }>,
  ) {}
  async create(createPaymentDto) {
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
