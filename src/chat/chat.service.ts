import { Injectable } from '@nestjs/common';
import ChatSchema from './chat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatSchema.name)
    private chatModel: Model<typeof ChatSchema>,
  ) {}
  create(createChatDto) {
    const chat = new this.chatModel(createChatDto);
    chat.save();
    return chat;
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
