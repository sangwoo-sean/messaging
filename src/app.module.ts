import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MessagingService } from './messaging/messaging.service';
import { MessagingController } from './messaging/messaging.controller';
import { MessagingProcessor } from './messaging-processor/messaging-processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'message-queue',
    }),
  ],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingProcessor],
})
export class AppModule {}
