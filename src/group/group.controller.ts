import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Types } from 'mongoose';

@UseGuards(new JwtAuthGuard('jwt'))
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  create(@Req() req: Request, @Body() createGroupBody) {
    const { id } = req['user'];
    createGroupBody['members'] = [new Types.ObjectId(id)];
    return this.groupService.create(createGroupBody);
  }

  @Get()
  async getAllUserGroups(@Req() req: Request) {
    const { id } = req['user'];
    return this.groupService.getAllUserGroups(id);
  }

  @Post(':id/join')
  joinGroup(@Req() req: Request, @Param('id') groupId) {
    const { id } = req['user'];
    return this.groupService.joinGroup(groupId, new Types.ObjectId(id));
  }

  @Get(':id/transactions')
  getAllTransactions(@Param('id') groupId) {
    return this.groupService.getAllTransactions(groupId);
  }
}
