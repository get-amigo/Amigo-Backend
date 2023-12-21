import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards,Req} from '@nestjs/common';
import { GroupService } from './group.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @UseGuards(new JwtAuthGuard('jwt'))
  @Post()
  create(@Req() req: Request,@Body() createGroupBody) {
    // const { id } = req["user"];
    console.log("rc",req["user"])
    createGroupBody["members"]=[

    ];
    return this.groupService.create(createGroupBody);
  }

  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto) {
    return this.groupService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(+id);
  }
}
