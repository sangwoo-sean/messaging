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

    try {
      const result = await this.messagingService.sendMessage(tokens, message);

      this.storageService.updateRequestSuccess(
        requestId,
        result.filter((r) => r.result === 200).map((r) => r.token),
      );

      this.storageService.updateRequestFailed(
        requestId,
        result.filter((r) => r.result !== 200),
      );
    } catch (error) {
      this.storageService.updateRequestFailed(
        requestId,
        tokens.map((t: string) => ({ token: t, message: error.message })),
      );
    }
  }
}
