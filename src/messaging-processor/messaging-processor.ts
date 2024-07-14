import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MessagingService } from '../messaging/messaging.service';
import { InMemoryStorageService } from '../messaging/in-memory-storage.service';

@Processor('message-queue')
export class MessagingProcessor {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly storageService: InMemoryStorageService,
  ) {}

  @Process()
  async handleTranscode(job: Job) {
    const { tokens, message, requestId } = job.data;
    this.storageService.updateRequest(requestId, 'processing');

    try {
      await this.messagingService.sendMessage(tokens, message);
      this.storageService.updateRequest(requestId, 'completed');
    } catch (error) {
      this.storageService.updateRequest(requestId, 'failed', error.message);
    }
  }
}
