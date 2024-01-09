import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BalanceSchema from './balance.schema';
import mongoose from 'mongoose';

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

  async findAll(userId) {
    try {
      const balances = await this.balanceModel
        .find({
          $or: [{ lender: userId }, { borrower: userId }],
        })
        .populate({
          path: 'group',
          select: 'name', // Populating only the name of the group
        })
        // Updated to include phoneNumber and countryCode
        .populate('lender', 'name phoneNumber countryCode')
        .populate('borrower', 'name phoneNumber countryCode')
        .exec();

      return balances;
    } catch (error) {
      console.error(error);
      throw error; // Rethrow the error for further handling
    }
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

  minimizeTransactions(transactions) {
    let balances = {};

    // Calculate net balances for each individual
    transactions.forEach((transaction) => {
      if (!balances[transaction.lender]) {
        balances[transaction.lender] = 0;
      }
      if (!balances[transaction.borrower]) {
        balances[transaction.borrower] = 0;
      }

      balances[transaction.lender] += transaction.amount;
      balances[transaction.borrower] -= transaction.amount;
    });

    let creditors = [];
    let debtors = [];
    
    // Separate into creditors and debtors
    for (let person in balances) {
      if (balances[person] > 0) {
        creditors.push({ person, amount: balances[person] });
      } else if (balances[person] < 0) {
        debtors.push({ person, amount: -balances[person] });
      }
    }

    let optimizedTransactions = [];

    // Minimize transactions
    while (creditors.length && debtors.length) {
      let creditor = creditors[0];
      let debtor = debtors[0];
      let minAmount = Math.min(creditor.amount, debtor.amount);

      optimizedTransactions.push({
        lender: creditor.person,
        borrower: debtor.person,
        amount: minAmount,
      });

      creditor.amount -= minAmount;
      debtor.amount -= minAmount;

      if (creditor.amount === 0) creditors.shift();
      if (debtor.amount === 0) debtors.shift();
    }

    return optimizedTransactions;
  }

  async fetchAndMinimizeTransaction(groupId, concatenatedTransactions = []) {
    const savedBalances = await this.balanceModel.find({ group: groupId });
    const combinedBalances = savedBalances.concat(concatenatedTransactions);
    const updatedBalances = this.minimizeTransactions(combinedBalances);
    updatedBalances.forEach((obj) => (obj.group = groupId));
    await this.balanceModel.deleteMany({ group: groupId });
    return await this.balanceModel.insertMany(updatedBalances);
  }

  async updateBalancesAfterTransaction(transactionDto) {
    const { paidBy, splitAmong, group } = transactionDto;
    const balances = splitAmong.reduce((acc, { user, amount }) => {
      if (paidBy !== user) {
        acc.push({
          lender: paidBy,
          borrower: user,
          amount,
        });
      }
      return acc;
    }, []);
    return this.fetchAndMinimizeTransaction(group, balances);
  }

  async updateBalancesAfterTransactionDeletion(transaction) {
    const { paidBy, splitAmong, group } = transaction;

    // Create balance adjustments to reverse the deleted transaction
    const reverseBalances = splitAmong.reduce((acc, { user, amount }) => {
      if (paidBy !== user) {
        acc.push({
          lender: user, // Reversing the lender and borrower
          borrower: paidBy,
          amount, // The amount remains the same
        });
      }
      return acc;
    }, []);

    // Update the balances in the group by processing these reverse balances
    return this.fetchAndMinimizeTransaction(group, reverseBalances);
  }

  async getBalanceDataByGroup(groupId) {
    return await this.balanceModel
      .find({ group: groupId })
      .populate('borrower', 'name')
      .populate('lender', 'name') // Populate the 'user' field and include 'name' only
      .exec();
  }
}
