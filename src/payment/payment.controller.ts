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
import { PaymentService } from './payment.service';
import { UsersController } from 'src/users/users.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(new JwtAuthGuard('jwt'))
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() createPaymentDto, @Req() req: Request) {
    const { id } = req['user'];
    return this.paymentService.create(createPaymentDto,id);
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
