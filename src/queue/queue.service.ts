import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendMessageDto } from '../messaging/dto/send-message.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
  ) {}

  async addMessage(data: SendMessageDto) {
    await this.messageQueue.add(data, {
      attempts: 3,
      backoff: 5000,
    });
  }
}
