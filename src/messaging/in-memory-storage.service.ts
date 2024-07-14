import { Injectable } from '@nestjs/common';
import {
  MessagingStatus,
  RequestStatus,
} from './interfaces/request-status.interface';

@Injectable()
export class InMemoryStorageService {
  private storage: Map<string, RequestStatus> = new Map();

  createRequest(id: string, status: MessagingStatus, message?: string): void {
    this.storage.set(id, { id, status, message });
  }

  updateRequest(id: string, status: MessagingStatus, message?: string): void {
    if (this.storage.has(id)) {
      this.storage.set(id, { id, status, message });
    }
  }

  getRequestStatus(id: string): RequestStatus | undefined {
    return this.storage.get(id);
  }
}
