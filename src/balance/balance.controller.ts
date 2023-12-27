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
  findAll(@Req() req: Request) {
    const { id } = req['user'];
    return this.balanceService.findAll(id);
  }

  @Get(':id')
  findAllBalanceGroup(@Param('id')  groupId) {
    return this.balanceService.getBalanceDataByGroup(groupId);
  }
}
