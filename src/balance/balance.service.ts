import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BalanceSchema from './balance.schema';

@Injectable()
export class BalanceService {
  constructor(
    @InjectModel(BalanceSchema.name) private balanceModel: Model<typeof BalanceSchema>,
  ) {}

  async create(createBalanceDto) {
    const newBalance = new this.balanceModel(createBalanceDto);
    return newBalance.save();
  }

  async findAll() {
    return this.balanceModel.find().exec();
  }

  async findOne(id: string) {
    const balance = await this.balanceModel.findById(id).exec();
    if (!balance) {
      throw new NotFoundException(`Balance with ID ${id} not found`);
    }
    return balance;
  }

  async update(id: string, updateBalanceDto) {
    const updatedBalance = await this.balanceModel.findByIdAndUpdate(id, updateBalanceDto, { new: true }).exec();
    if (!updatedBalance) {
      throw new NotFoundException(`Balance with ID ${id} not found`);
    }
    return updatedBalance;
  }

  async remove(id: string) {
    const deletedBalance = await this.balanceModel.findByIdAndDelete(id).exec();
    if (!deletedBalance) {
      throw new NotFoundException(`Balance with ID ${id} not found`);
    }
    return deletedBalance;
  }

  async updateBalancesAfterTransaction(transactionDto) {
    // Your logic to update balances based on the transaction
    // ...
}
}
