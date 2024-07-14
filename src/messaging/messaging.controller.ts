import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';
import { SendMessageDto } from './dto/send-message.dto';
import { QueueService } from '../queue/queue.service';
import { InMemoryStorageService } from './in-memory-storage.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('messaging')
export class MessagingController {
  constructor(
    private readonly queueService: QueueService,
    private readonly storageService: InMemoryStorageService,
  ) {}

  @Post('send')
  @UseInterceptors(FileInterceptor('file'))
  async sendMessages(
    @Body() body: SendMessageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { tokens, message } = body;
    const requestId = uuidv4();

    // If a file is uploaded, parse the file for tokens
    if (file) {
      try {
        const tokensFromFile = await this.parseFile(file);
        await this.queueService.addMessage({
          tokens: tokensFromFile,
          message,
          requestId,
        });

        this.storageService.createRequest(
          requestId,
          'queued',
          message.title,
          message.body,
          tokensFromFile,
        );
        return { status: 'queued', requestId };
      } catch (error) {
        this.storageService.createRequest(
          requestId,
          'failed',
          message.title,
          message.body,
          [],
          error.message,
        );
        throw new BadRequestException('Failed to parse file.');
      }
    }

    // If tokens are provided in the body
    if (tokens) {
      console.log('Received & Queue', message, tokens);
      this.storageService.createRequest(
        requestId,
        'queued',
        message.title,
        message.body,
        tokens,
      );
      await this.queueService.addMessage({ tokens, message, requestId });
      return { status: 'queued', requestId };
    }

    this.storageService.updateRequest(
      requestId,
      'failed',
      'No valid input found',
    );
    throw new BadRequestException('No valid input found');
  }

  @Post('send-multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async sendMessagesFromMultipleFiles(
    @Body() body: SendMessageDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const { message } = body;
    const requestId = uuidv4();

    try {
      const tokens = await this.parseFilesUnsafe(files);

      this.storageService.createRequest(
        requestId,
        'queued',
        message.title,
        message.body,
        tokens,
      );
      await this.queueService.addMessage({ tokens, message, requestId });
      return { status: 'queued', requestId };
    } catch (error) {
      this.storageService.createRequest(
        requestId,
        'failed',
        message.title,
        message.body,
        [],
        error.message,
      );
      throw new BadRequestException(error.message);
    }
  }

  @Get('status/:id')
  getRequestStatus(@Param('id') id: string) {
    const status = this.storageService.getRequestStatus(id);
    if (!status) {
      throw new BadRequestException('Invalid request ID');
    }
    return status;
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

  private async parseFilesUnsafe(
    files: Express.Multer.File[],
  ): Promise<string[]> {
    try {
      const tokenPromises = files.map((file) => this.parseFile(file));
      const tokensArrays = await Promise.all(tokenPromises);
      return tokensArrays.flat();
    } catch (e) {
      throw new BadRequestException('Failed to parse one or more files.');
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
