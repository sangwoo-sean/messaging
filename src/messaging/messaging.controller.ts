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
import * as XLSX from 'xlsx';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messaging')
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
  ) {}

  @Post('send')
  @UseInterceptors(FileInterceptor('file'))
  async sendMessages(
    @Body() body: SendMessageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { tokens, message } = body;

    // If a file is uploaded, parse the file for tokens
    if (file) {
      const tokensFromFile = await this.parseFile(file);
      await this.messageQueue.add({ tokens: tokensFromFile, message });
      return { status: 'queued' };
    }

    // If tokens are provided in the body
    if (tokens) {
      console.log('Received & Queue', message, tokens);
      await this.messageQueue.add({ tokens, message });
      return { status: 'queued' };
    }

    throw new Error('No valid input found');
  }

  @Post('send-multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async sendMessagesFromMultipleFiles(
    @Body() body: SendMessageDto,
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

  private async parseFile(file: Express.Multer.File): Promise<string[]> {
    const extension = file.originalname.split('.').pop();
    if (extension === 'csv') {
      return this.parseCsv(file.buffer);
    } else if (extension === 'xlsx') {
      return this.parseXlsx(file.buffer);
    } else {
      throw new Error('Unsupported file format');
    }
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

  private parseXlsx(buffer: Buffer): string[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Assuming the first row is the header and tokens are in the first column
    const tokens: string[] = [];
    jsonData.slice(1).forEach((row: any) => {
      if (row[0]) {
        tokens.push(row[0]);
      } else {
        console.log('Row without token:', row);
      }
    });

    return tokens;
  }
}
