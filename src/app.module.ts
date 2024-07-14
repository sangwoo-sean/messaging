import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { MessagingService } from './messaging/messaging.service';
import { MessagingController } from './messaging/messaging.controller';
import { MessagingProcessor } from './messaging-processor/messaging-processor';
import { AllExceptionsFilter } from './logging/all-exceptions.filter';
import { LoggingInterceptor } from './logging/logging.interceptor';
import { winstonLogger } from './logging/winston.logger';
import { QueueService } from './queue/queue.service';

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
  providers: [
    QueueService,
    MessagingService,
    MessagingProcessor,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    {
      provide: 'winston',
      useFactory: () => winstonLogger,
    },
  ],
})
export class AppModule {}
