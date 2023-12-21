import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { MongooseModule } from '@nestjs/mongoose';
import GroupSchema from './group.schema';

@Module({
  imports: [MongooseModule.forFeature([GroupSchema])],
  controllers: [GroupController],
  providers: [GroupService]
})
export class GroupModule {}
