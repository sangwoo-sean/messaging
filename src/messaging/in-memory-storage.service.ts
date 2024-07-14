import { Injectable } from '@nestjs/common';
import {
  ReceiverEntity,
  RequestEntity,
} from './interfaces/request-status.interface';

@Injectable()
export class InMemoryStorageService {
  private storage: Map<string, RequestEntity> = new Map();

  createRequest(
    id: string,
    title: string,
    body: string,
    tokens: string[],
  ): void {
    const receivers: ReceiverEntity[] = tokens.map((token) => ({
      token,
      status: 'queued',
    }));

    this.storage.set(id, { id, title, description: body, receivers });
  }

  updateRequestSuccess(requestId: string, tokens: string[]): void {
    const request = this.storage.get(requestId);
    if (!request) {
      return;
    }

    const receivers: ReceiverEntity[] = request.receivers.map((receiver) => {
      if (tokens.includes(receiver.token)) {
        return {
          ...receiver,
          status: 'completed',
        };
      }
      return receiver;
    });

    this.storage.set(requestId, { ...request, receivers });
  }

  updateRequestFailed(
    requestId: string,
    results: { token: string; message: string }[],
  ): void {
    const request = this.storage.get(requestId);
    if (!request) {
      return;
    }

    request.receivers.map((receiver) => {
      const result = results.find((r) => r.token === receiver.token);
      if (result) {
        return {
          ...receiver,
          status: 'failed',
          message: result.message,
        };
      }
      return receiver;
    });

    this.storage.set(requestId, request);
  }

  getRequestStatus(id: string): RequestEntity | undefined {
    return this.storage.get(id);
  }
}
