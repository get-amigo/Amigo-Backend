import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BalanceService } from './balance.service';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post()
  create(@Body() createBalanceDto) {
    return this.balanceService.create(createBalanceDto);
  }

  @Get()
  findAll() {
    return this.balanceService.findAll();
  }
}
