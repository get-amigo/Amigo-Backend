import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BalanceSchema from './balance.schema';

@Injectable()
export class BalanceService {
  constructor(
    @InjectModel(BalanceSchema.name) private balanceModel: Model<{user: "string",
    group: string,
    amountOwed: Map<number,number>}>,
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
    try {
      // Get the group and transaction details
      const { group, paidBy, splitAmong, amount } = transactionDto;

      // Calculate the split amount per user
      const splitAmountPerUser = amount / splitAmong.length;

      // Update balances for each user in the group
      for (const split of splitAmong) {
        const user = split.user;
        const userBalance = await this.balanceModel.findOne({ user, group });

        // Update the user's balance
        userBalance.amountOwed = userBalance.amountOwed || new Map();
        userBalance.amountOwed.set(paidBy.toString(), (userBalance.amountOwed.get(paidBy.toString()) || 0) - splitAmountPerUser);

        // Save the updated balance
        await userBalance.save();
      }

      return true; // Indicates success
    } catch (error) {
      console.error('Error updating balances after transaction:', error);
      return false; // Indicates failure
    }
  }
}
