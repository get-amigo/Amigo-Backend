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
import { CompanyService } from './company.service';
import mongoose from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(new JwtAuthGuard('jwt'))
  @Post()
  create(@Req() req: Request, @Body() createCompanyDto) {
    const { id: userId } = req['user'];
    createCompanyDto.user = userId;
    return this.companyService.create(createCompanyDto);
  }

  @UseGuards(new JwtAuthGuard('jwt'))
  @Get()
  find(@Req() req: Request) {
    const userId = new mongoose.Types.ObjectId(req['user'].id);
    return this.companyService.find(userId);
  }

  @UseGuards(new JwtAuthGuard('jwt'))
  @Delete()
  remove(@Req() req: Request) {
    const userId = new mongoose.Types.ObjectId(req['user'].id);
    return this.companyService.remove(userId);
  }
}
