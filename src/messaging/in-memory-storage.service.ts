import { Injectable } from '@nestjs/common';
import {
  MessagingStatus,
  RequestStatus,
} from './interfaces/request-status.interface';

@Injectable()
export class InMemoryStorageService {
  private storage: Map<string, RequestStatus> = new Map();

  createRequest(
    id: string,
    status: MessagingStatus,
    title: string,
    body: string,
    tokens: string[],
    errorMessage?: string,
  ): void {
    this.storage.set(id, { id, status, title, body, tokens, errorMessage });
  }

  updateRequest(
    id: string,
    status: MessagingStatus,
    errorMessage?: string,
  ): void {
    if (this.storage.has(id)) {
      const requestStatus: RequestStatus = this.storage.get(id);
      this.storage.set(id, { ...requestStatus, status, errorMessage });
    }
  }

  getRequestStatus(id: string): RequestStatus | undefined {
    return this.storage.get(id);
  }
}
