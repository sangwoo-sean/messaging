import { Module } from '@nestjs/common';
import { MessagingService } from './messaging/messaging.service';
import { MessagingController } from './messaging/messaging.controller';

@Module({
  imports: [],
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class AppModule {}
