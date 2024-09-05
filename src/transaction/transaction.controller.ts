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
  Query,
  Put,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard'; 
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
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
  getExpenses(
    @Req() req: Request,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('type') type: string | string[],
    @Query('page') page: number,
    @Query('size') size: number,
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
  @UseGuards(RolesGuard) 
  getTransaction(@Param('id') transactionId) {
    return this.transactionService.getTransaction(transactionId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) 
  deleteTransaction(@Req() req: Request, @Param('id') transactionId) {
    return this.transactionService.deleteTransaction(transactionId);
  }

  @Put(':id')
  @UseGuards(RolesGuard) 
  async updateTransaction(
    @Param('id') transactionId: string,
    @Body() updateTransactionDto,
  ) {
    return this.transactionService.updateTransaction(transactionId, updateTransactionDto);
  }
}
