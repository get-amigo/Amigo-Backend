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
import { ActivityFeedService } from 'src/activity-feed/activity-feed.service';
import ActivityFeedSchema from 'src/activity-feed/activity-feed.schema';
import { ChatService } from 'src/chat/chat.service';
import { ChatModule } from 'src/chat/chat.module';
import ChatSchema from 'src/chat/chat.schema';
import GroupBalanceSchema from 'src/balance/groupBalance.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    TransactionModule,
    BalanceModule,
    UsersModule,
    ChatModule,
    MongooseModule.forFeature([
      GroupSchema,
      TransactionSchema,
      BalanceSchema,
      UsersSchema,
      ActivityFeedSchema,
      ChatSchema,
      GroupBalanceSchema,
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  
  controllers: [GroupController, UsersController],
  providers: [
    GroupService,
    TransactionService,
    BalanceService,
    UsersService,
    ActivityFeedService,
    ChatService,
  ],
})
export class GroupModule {}
