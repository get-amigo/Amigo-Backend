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
  createTransaction(@Body() createTransactionDto) {
    return this.transactionService.createTransaction(createTransactionDto);
  }

  // @Get(":groupId")
  // getAllTransactionsInGroup(@Req() req: Request,@Param('id') groupId){
  //   const { id } = req['user'];
  //   return this.transactionService.getTransactions()
  // }
}
