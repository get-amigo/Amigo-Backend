import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@UseGuards(new JwtAuthGuard('jwt'))
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

  @Get(":id")
  findAllBalanceGroup(@Param('id') groupId) {
    return this.balanceService.getBalanceData(groupId);
  }
}
