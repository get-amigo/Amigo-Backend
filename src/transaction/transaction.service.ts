import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import TransactionSchema from './transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(TransactionSchema.name)
    private transactionModel: Model<typeof TransactionSchema>,
  ) {}

  async createTransaction( createTransactionDto) {
    const newTransaction = new this.transactionModel(
      createTransactionDto
    );
    return newTransaction.save();
  }

}
