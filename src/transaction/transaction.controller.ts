import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { pushToNotificationQueue } from 'src/utils/queue';

@UseGuards(new JwtAuthGuard('jwt'))
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  async createTransaction(@Body() createTransactionDto, @Req() req: Request) {
    if (!createTransactionDto['transactionId']) {
      throw new BadRequestException('Transaction ID is required');
    }

    const { id } = req['user'];
    createTransactionDto['creator'] = id;

    const newTransaction = await this.transactionService.createTransaction(createTransactionDto);

    await pushToNotificationQueue(JSON.stringify({ type: "TRANSACTION_ADD", data: newTransaction }));

    return newTransaction;
  }

  @Get('expenses')
  getExpenses(
    @Req() req: Request,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('type') type: string | string[], // Modify the type parameter to accept a string or an array of strings
    @Query('page') page: number, // Page number
    @Query('size') size: number, // Number of results per page
  ) {
    const { id } = req['user'];
    return this.transactionService.getExpenses(
      id,
      startDate,
      endDate,
      type,
      page,
      size,
    );
  }

  @Get(':id')
  getTransaction(@Param('id') transactionId) {
    return this.transactionService.getTransaction(transactionId);
  }

  @Delete(':id')
  deleteTransaction(@Req() req: Request, @Param('id') transactionId) {
    return this.transactionService.deleteTransaction(transactionId);
  }
}
