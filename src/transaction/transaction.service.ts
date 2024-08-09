import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import TransactionSchema from './transaction.schema';
// Assuming there's a service or function to handle balance updates
import { BalanceService } from 'src/balance/balance.service'; // Import BalanceService or similar functionality
import { ActivityFeedService } from 'src/activity-feed/activity-feed.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(TransactionSchema.name)
    private transactionModel: Model<{
      _id: Types.ObjectId;
      creator;
      group;
      splitAmong;
      description;
      date;
      type;
    }>,
    private balanceService: BalanceService, // Inject BalanceService or similar functionality
    private activityFeedService: ActivityFeedService,
  ) {}

  async createTransaction(createTransactionDto) {
    const { transactionId, ...transactionData } = createTransactionDto;
    const newTransaction = new this.transactionModel({
      _id: new Types.ObjectId(transactionId),
      ...transactionData,
    });
    await newTransaction.save();
    const { creator, group, _id: relatedId } = newTransaction;
    this.activityFeedService.createActivity({
      _id:createTransactionDto.activityId,
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

  async getTransaction(transactionId) {
    return this.transactionModel
      .findById(transactionId)
      .populate('paidBy', 'name phoneNumber countryCode')
      .populate('creator', 'name phoneNumber countryCode')
      .populate([
        { path: 'splitAmong.user', select: 'name phoneNumber countryCode' },
      ]);
  }

  async getExpenses(userId, startDate, endDate, type, page, size) {
    const query = { 'splitAmong.user': userId };

    if (startDate && endDate) {
      query['date'] = { $gte: startDate, $lte: endDate };
    }

    if (type) {
      if (Array.isArray(type)) {
        // If 'type' is an array, filter transactions matching any type in the array
        query['type'] = { $in: type };
      } else {
        // If 'type' is a single value, filter transactions with that type
        query['type'] = type;
      }
    }

    const skip = (page - 1) * size; // Calculate how many documents to skip
    const limit = size;

    try {
      const transactions = await this.transactionModel
        .find(query) // Apply filter criteria
        .populate('group', 'name') // Assuming you want the group's name
        .sort({ date: -1 })
        .skip(skip) // Skip the specified number of documents
        .limit(limit) // Limit the number of results per page
        .exec();

      // Transform the data to the specified shape
      const transformedTransactions = transactions.map((transaction) => {
        const userShare = transaction.splitAmong.find(
          (sa) => sa.user.toString() === userId.toString(),
        )?.amount;
        return {
          id: transaction._id,
          amount: userShare, // User's share
          group: transaction.group,
          description: transaction.description,
          date: transaction.date,
          category: transaction.type,
        };
      });

      return transformedTransactions;
    } catch (error) {
      // Handle any errors that occur during the database query
      throw new Error(`Error fetching expenses: ${error.message}`);
    }
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
