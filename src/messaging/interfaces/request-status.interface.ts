export type MessagingStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface RequestStatus {
  id: string;
  status: MessagingStatus;
  title: string;
  body: string;
  tokens: string[];
  errorMessage?: string;
}
