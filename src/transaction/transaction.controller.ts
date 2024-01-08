import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
@UseGuards(new JwtAuthGuard('jwt'))
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  createTransaction(@Body() createTransactionDto, @Req() req: Request) {
    const { id } = req['user'];
    createTransactionDto['creator'] = id;
    return this.transactionService.createTransaction(createTransactionDto);
  }

  @Get('expenses')
  getExpenses(@Req() req: Request) {
    const { id } = req['user'];
    return this.transactionService.getExpenses(id);
  }

  @Delete(':id')
  deleteTransaction(@Req() req: Request, @Param('id') transactionId) {
    return this.transactionService.deleteTransaction(transactionId);
  }
}
