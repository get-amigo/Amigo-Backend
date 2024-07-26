import { Injectable, NotFoundException } from '@nestjs/common';
import ChatSchema from './chat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatSchema.name)
    private chatModel: Model<typeof ChatSchema>,
  ) {}

  async create(createChatDto, chatId = undefined) {
    const chat = new this.chatModel({
      _id: chatId ? new Types.ObjectId(chatId) : undefined,
      ...createChatDto,
    });
    return await chat.save();
  }

  async findAll() {
    return await this.chatModel.find().exec();
  }

  async findOne(id: string) {
    const chat = await this.chatModel.findById(id).exec();
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${id} not found`);
    }
    return chat;
  }

  async update(id: string, updateChatDto) {
    const updatedChat = await this.chatModel.findByIdAndUpdate(id, updateChatDto, { new: true }).exec();
    if (!updatedChat) {
      throw new NotFoundException(`Chat with ID ${id} not found`);
    }
    return updatedChat;
  }

  async remove(id: string) {
    const deletedChat = await this.chatModel.findByIdAndDelete(id).exec();
    if (!deletedChat) {
      throw new NotFoundException(`Chat with ID ${id} not found`);
    }
    return deletedChat;
  }
}
