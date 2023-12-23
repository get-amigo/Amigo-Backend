import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BalanceSchema from './balance.schema';

@Injectable()
export class BalanceService {
  constructor(
    @InjectModel(BalanceSchema.name)
    private balanceModel: Model<{
      user: 'string';
      group: string;
      amountOwed: Map<number, number>;
    }>,
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
    const updatedBalance = await this.balanceModel
      .findByIdAndUpdate(id, updateBalanceDto, { new: true })
      .exec();
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

  async reduceTransactions(group: string) {
    try {
      // Get the balances for the specified group
      const balances = await this.balanceModel.find({ group }).exec();

      // Separate users into two categories: positive balance and negative balance
      const positiveBalances = balances.filter((balance) => {
        const totalOwed = [...balance.amountOwed.values()].reduce(
          (acc, amount) => acc + amount,
          0,
        );
        return totalOwed > 0;
      });

      const negativeBalances = balances.filter((balance) => {
        const totalOwed = [...balance.amountOwed.values()].reduce(
          (acc, amount) => acc + amount,
          0,
        );
        return totalOwed < 0;
      });

      // Sort users in each category by the absolute value of their total owed amount
      positiveBalances.sort((a, b) => {
        const totalA = [...a.amountOwed.values()].reduce(
          (acc, amount) => acc + Math.abs(amount),
          0,
        );
        const totalB = [...b.amountOwed.values()].reduce(
          (acc, amount) => acc + Math.abs(amount),
          0,
        );
        return totalB - totalA;
      });

      negativeBalances.sort((a, b) => {
        const totalA = [...a.amountOwed.values()].reduce(
          (acc, amount) => acc + Math.abs(amount),
          0,
        );
        const totalB = [...b.amountOwed.values()].reduce(
          (acc, amount) => acc + Math.abs(amount),
          0,
        );
        return totalB - totalA;
      });

      // Perform the balancing algorithm and generate optimized transactions
      const transactions = [];

      while (positiveBalances.length > 0 && negativeBalances.length > 0) {
        const receiver = positiveBalances[0];
        const sender = negativeBalances[0];

        const amountTransferred = Math.min(
          Math.abs(
            [...sender.amountOwed.values()].reduce(
              (acc, amount) => acc + amount,
              0,
            ),
          ),
          Math.abs(
            [...receiver.amountOwed.values()].reduce(
              (acc, amount) => acc + amount,
              0,
            ),
          ),
        );

        // Create a transaction for the amount transferred
        transactions.push({
          from: sender.user,
          to: receiver.user,
          amount: amountTransferred,
        });

        // Update balances
        [...sender.amountOwed.keys()].forEach((payerId) => {
          sender.amountOwed.set(
            payerId,
            (sender.amountOwed.get(payerId) || 0) + amountTransferred,
          );
        });

        [...receiver.amountOwed.keys()].forEach((payerId) => {
          receiver.amountOwed.set(
            payerId,
            (receiver.amountOwed.get(payerId) || 0) - amountTransferred,
          );
        });

        // Remove users with zero balance from their respective categories
        if ([...sender.amountOwed.values()].every((amount) => amount === 0)) {
          negativeBalances.shift();
        }

        if ([...receiver.amountOwed.values()].every((amount) => amount === 0)) {
          positiveBalances.shift();
        }
      }

      // At this point, the `transactions` array contains optimized transactions
      return transactions;
    } catch (error) {
      console.error('Error reducing transactions:', error);
      return null;
    }
  }

  async updateBalancesAfterTransaction(transactionDto) {
    try {
      // Get the group and transaction details
      const { group, paidBy, splitAmong } = transactionDto;
  
      // Update balances for each user in the group
      for (const split of splitAmong) {
        const user = split.user;
  
        // Skip if the user is the one who paid, as a user can't owe money to themselves
        if (paidBy.toString() === user.toString()) {
          continue;
        }
  
        let userBalance = await this.balanceModel.findOne({ user, group });
  
        // If userBalance doesn't exist, create a new one
        if (!userBalance) {
          userBalance = new this.balanceModel({
            user,
            group,
            amountOwed: {} // Initialize an empty Map
          });
        }
  
        // Convert amountOwed to a JavaScript Map
        const owedAmounts = new Map(userBalance.amountOwed);
  
        // Update the owed amount
        const paidByIdString = paidBy.toString();
        const currentOwedAmount = owedAmounts.get(paidByIdString) || 0;
        owedAmounts.set(paidByIdString, currentOwedAmount - split.amount);
  
        // Update userBalance with the new amountOwed Map
        userBalance.amountOwed = owedAmounts;
  
        // Save the updated balance
        await userBalance.save();
      }
  
      // Assuming this method handles reducing redundant transactions within the group
      await this.reduceTransactions(group);
      return true; // Indicates success
    } catch (error) {
      console.error('Error updating balances after transaction:', error);
      return false; // Indicates failure
    }
  }

  
async getBalanceData(groupId) {
    return await this.balanceModel.find({ group: groupId }).exec();
}
  
}
