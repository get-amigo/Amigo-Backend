import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Types } from 'mongoose';

@UseGuards(new JwtAuthGuard('jwt'))
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) { }

  @Post()
  create(@Req() req: Request, @Body() createGroupBody) {
    const { id } = req['user'];
    createGroupBody['members'] = [new Types.ObjectId(id)];
    return this.groupService.create(createGroupBody);
  }


  @Delete(':id')
  leaveGroup(@Req() req: Request, @Param('id') groupId) {
    const { id } = req['user'];
    return this.groupService.leaveGroup(id, groupId);
  }

  @Patch(':id')
  addMembers(@Param('id') groupId, @Body() phoneNumbers) {
    return this.groupService.addMembers(groupId, phoneNumbers);
  }

  @Get()
  async getAllUserGroups(@Req() req: Request) {
    const { id } = req['user'];
    return this.groupService.getAllUserGroups(id);
  }

  @Patch()
  async editGroupName(
    @Query('id') groupId: string,
    @Body('groupName') groupName: string,
  ) {
    return this.groupService.editGroupName(groupId, groupName);
  }

  @Post(':id/join')
  joinGroup(@Req() req: Request, @Param('id') hashedGroupId) {
    const { id } = req['user'];
    return this.groupService.joinGroup(hashedGroupId, new Types.ObjectId(id));
  }

  @Post(':id/chat')
  createChat(@Req() req: Request, @Param('id') groupId, @Body() body) {
    let { message, activityId, chatId, replyTo, replyingMessage } = body;
    console.log(`Received message: ${replyTo} ${replyingMessage}`);

    const { id } = req['user'];

    if (replyTo && replyingMessage) {
      return this.groupService.createChat(
        { message },
        replyTo,
        replyingMessage,
        groupId,
        new Types.ObjectId(id),
        new Types.ObjectId(activityId),
        new Types.ObjectId(chatId)
      );
    } else {
      replyTo = null
      replyingMessage = null
      return this.groupService.createChat(
        { message },
        replyTo,
        replyingMessage,
        groupId,
        new Types.ObjectId(id),
        new Types.ObjectId(activityId),
        new Types.ObjectId(chatId)
      );
    }
  }


  @Get(':id/transactions')
  getAllTransactions(@Param('id') groupId) {
    return this.groupService.getAllTransactions(groupId);
  }

  @Get(':id/token')
  async getGroupToken(@Param('id') groupId) {
    return this.groupService.generateToken(groupId);
  }
}