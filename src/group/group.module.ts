import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { MongooseModule } from '@nestjs/mongoose';
import GroupSchema from './group.schema';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import TransactionSchema from 'src/transaction/transaction.schema';
import { BalanceModule } from 'src/balance/balance.module';
import { BalanceService } from 'src/balance/balance.service';
import BalanceSchema from 'src/balance/balance.schema';
import UsersSchema from 'src/users/users.schema';
import { UsersModule } from 'src/users/users.module';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TransactionModule,
    BalanceModule,
    UsersModule,
    MongooseModule.forFeature([
      GroupSchema,
      TransactionSchema,
      BalanceSchema,
      UsersSchema,
    ]),
  ],
  controllers: [GroupController, UsersController],
  providers: [GroupService, TransactionService, BalanceService, UsersService],
})
export class GroupModule {}
