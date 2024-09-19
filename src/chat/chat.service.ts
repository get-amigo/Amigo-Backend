import { Injectable, NotFoundException } from '@nestjs/common';
import ChatSchema from './chat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { create } from 'domain';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatSchema.name)
    private chatModel: Model<typeof ChatSchema>,
  ) { }

  async create(createChatDto: any, chatId: string | undefined = undefined) {
    console.log('Received DTO:', createChatDto);

    let messageContent = createChatDto.message;
    if (typeof messageContent === 'object' && messageContent.message) {
      messageContent = messageContent.message;
    }

    const chat = new this.chatModel({
      _id: chatId ? new Types.ObjectId(chatId) : undefined,
      message: messageContent,
      replyTo: createChatDto.replyTo,  // Keep replyTo as is
      replyingMessage: createChatDto.replyingMessage,
    });

    console.log('Saving chat:', chat);
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
