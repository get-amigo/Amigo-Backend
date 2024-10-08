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
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(new JwtAuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post()
  create(@Body() createChatDto, @Req() req: Request) {
    const { id } = req['user']; // Get user ID from JWT payload
    console.log('Received message', createChatDto);  // Log the message

    // You can add logic to save or process the message
    return this.chatService.create(createChatDto);
  }


  @Get()
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto) {
    return this.chatService.update(id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }
}