import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MessagingService } from './messaging.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Controller('messaging')
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
  ) {}

  @Post('send')
  @UseInterceptors(FileInterceptor('file'))
  async sendMessages(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { tokens, message } = body;

    // If a file is uploaded, parse the file for tokens
    if (file) {
      const tokensFromFile = await this.parseCsv(file.buffer);
      await this.messageQueue.add({ tokens: tokensFromFile, message });
      return { status: 'queued' };
    }

    // If tokens are provided in the body
    if (tokens) {
      await this.messageQueue.add({ tokens, message });
      return { status: 'queued' };
    }

    throw new Error('No valid input found');
  }

  @Post('send-multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async sendMessagesFromMultipleFiles(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const { message } = body;

    // Parse all files and collect tokens
    const tokenPromises = files.map((file) => this.parseCsv(file.buffer));
    const tokensArrays = await Promise.all(tokenPromises);
    const tokens = tokensArrays.flat();

    await this.messageQueue.add({ tokens, message });
    return { status: 'queued' };
  }

  private parseCsv(buffer: Buffer): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const tokens: string[] = [];
      const stream = Readable.from(buffer.toString());
      stream
        .pipe(csv())
        .on('data', (row) => tokens.push(row.token))
        .on('end', () => resolve(tokens))
        .on('error', reject);
    });
  }
}
