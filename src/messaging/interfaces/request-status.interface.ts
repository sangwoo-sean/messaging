export type MessagingStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface RequestStatus {
  id: string;
  status: MessagingStatus;
  message?: string;
}
