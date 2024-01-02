import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import TransactionSchema from './transaction.schema';
// Assuming there's a service or function to handle balance updates
import { BalanceService } from 'src/balance/balance.service'; // Import BalanceService or similar functionality
import { ActivityFeedService } from 'src/activity-feed/activity-feed.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(TransactionSchema.name)
    private transactionModel: Model<{ creator; group;splitAmong;description;date }>,
    private balanceService: BalanceService, // Inject BalanceService or similar functionality
    private activityFeedService: ActivityFeedService,
  ) {}

  async createTransaction(createTransactionDto) {
    const newTransaction = new this.transactionModel(createTransactionDto);
    await newTransaction.save();
    const { creator, group, _id: relatedId } = newTransaction;
    this.activityFeedService.createActivity({
      creator,
      group,
      relatedId,
      activityType: 'transaction',
      onModel: 'Transaction',
      description: 'transaction created',
    });
    await this.balanceService.updateBalancesAfterTransaction(
      createTransactionDto,
    );

    return newTransaction;
  }

  getExpenses(userId) {
    return this.transactionModel
      .find({ 'splitAmong.user': userId }) // Filter transactions where the user is in splitAmong
      .populate('group', 'name') // Assuming you want the group's name
      .sort({ date: -1 })
      .exec()
      .then(transactions => {
        // Transform the data to the specified shape
        return transactions.map(transaction => {
          const userShare = transaction.splitAmong.find(sa => sa.user.toString() === userId.toString())?.amount;
          return {
            amount: userShare, // User's share
            group: transaction.group.name,
            description: transaction.description,
            date: transaction.date
          };
        });
      });
  }
  

  async deleteTransaction(transactionId: string) {
    // Find the transaction by its ID
    const transaction = await this.transactionModel
      .findById(transactionId)
      .exec();
    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    await this.activityFeedService.deleteByRelationId(transactionId);
    // Delete the transaction
    await this.transactionModel.findByIdAndDelete(transactionId).exec();

    // Update balances after the transaction is deleted
    // Assuming a method like this exists in your BalanceService
    await this.balanceService.updateBalancesAfterTransactionDeletion(
      transaction,
    );

    // Return some confirmation message or the deleted transaction
    return transaction;
  }

  getTransactionsByGroupId(groupId) {
    return this.transactionModel
      .find({ group: groupId })
      .populate('paidBy', 'name')
      .populate('creator', 'name')
      .populate({
        path: 'splitAmong.user',
        select: 'name',
      })
      .sort({ date: -1 }) // Sort by date in descending order
      .exec();
  }
}
