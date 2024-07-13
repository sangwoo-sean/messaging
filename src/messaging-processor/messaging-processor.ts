import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MessagingService } from '../messaging/messaging.service';

@Processor('message-queue')
export class MessagingProcessor {
  constructor(private readonly messagingService: MessagingService) {}

  @Process()
  async handleTranscode(job: Job) {
    const { tokens, message } = job.data;
    console.log('Process', tokens, message);
    return await this.messagingService.sendMessage(tokens, message);
  }
}
