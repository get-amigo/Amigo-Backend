import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { MongooseModule } from '@nestjs/mongoose';
import CompanySchema from './company.schema';
import officeSchema from './company.schema/office.schema';
import contactSchema from './company.schema/contact.schema';
import usersSchema from 'src/users/users.schema';
import addressSchema from './company.schema/address.schema';
import legalSchema from './company.schema/legal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      CompanySchema,
      officeSchema,
      contactSchema,
      usersSchema,
      addressSchema,
      legalSchema,
    ]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
