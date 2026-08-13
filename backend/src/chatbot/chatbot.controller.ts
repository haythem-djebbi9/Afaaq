import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatbotService } from './chatbot.service';
import { SendMessageDto } from './dto/send-message.dto';

interface AuthedRequest {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('messages')
  history(@Req() req: AuthedRequest) {
    return this.chatbotService.getHistory(req.user.userId);
  }

  @Post('messages')
  async send(@Req() req: AuthedRequest, @Body() dto: SendMessageDto, @Res() res: Response) {
    await this.chatbotService.streamReply(req.user.userId, dto.message, res);
  }
}
