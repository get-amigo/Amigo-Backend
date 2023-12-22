import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import TransactionSchema from './transaction.schema';
// Assuming there's a service or function to handle balance updates
import { BalanceService } from 'src/balance/balance.service'; // Import BalanceService or similar functionality

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(TransactionSchema.name)
    private transactionModel: Model<typeof TransactionSchema>,
    private balanceService: BalanceService, // Inject BalanceService or similar functionality
  ) {}

  async createTransaction(createTransactionDto) {
    // Create and save the new transaction
    const newTransaction = new this.transactionModel(createTransactionDto);
    await newTransaction.save();

    // After saving the transaction, update balances
    await this.updateBalances(createTransactionDto);

    return newTransaction;
  }

  private async updateBalances(transactionDto) {
    // Implement the logic to update balances based on the transaction details
    // Example: Call a method from BalanceService to update balances
    // This method should contain the business logic for updating balances
    // based on the Splitwise algorithm or similar logic
    await this.balanceService.updateBalancesAfterTransaction(transactionDto);
  }
}
