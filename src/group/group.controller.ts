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
import { GroupService } from './group.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Types } from 'mongoose';
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @UseGuards(new JwtAuthGuard('jwt'))
  @Post()
  create(@Req() req: Request, @Body() createGroupBody) {
    const { id } = req['user'];
    createGroupBody['members'] = [new Types.ObjectId(id)];
    return this.groupService.create(createGroupBody);
  }

  @UseGuards(new JwtAuthGuard('jwt'))
  @Post(':id/join')
  joinGroup(@Req() req: Request, @Param('id') groupId) {
    const { id } = req['user'];
    return this.groupService.joinGroup(groupId, new Types.ObjectId(id));
  }
}
