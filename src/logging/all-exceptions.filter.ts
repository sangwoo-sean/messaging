import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as HttpException).message
        : exception;

    // Log the error
    this.logger.error(`HTTP ${status} ${JSON.stringify(message)}`);

    // Send the response
    response.status(status).json({
      statusCode: status,
      message:
        exception instanceof HttpException ? message : 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
