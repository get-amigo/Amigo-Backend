import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { TransactionModule } from './transaction/transaction.module';
import { BalanceModule } from './balance/balance.module';
import { PaymentModule } from './payment/payment.module';
import { ActivityFeedModule } from './activity-feed/activity-feed.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['.env'], isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    UsersModule,
    AuthModule,
    GroupModule,
    TransactionModule,
    BalanceModule,
    PaymentModule,
    ActivityFeedModule,
    ChatModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
