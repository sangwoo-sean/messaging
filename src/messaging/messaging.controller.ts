import { Controller, Post, Body } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('send')
  async sendMessages(@Body() body: { tokens: string[], message: any }) {
    const { tokens, message } = body;
    const result = await this.messagingService.sendMessage(tokens, message);
    return result;
  }
}
