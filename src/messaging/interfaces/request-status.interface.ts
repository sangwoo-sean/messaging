export type MessagingStatus = 'queued' | 'processing' | 'completed' | 'failed';

export class RequestEntity {
  id: string;
  title: string;
  body: string;
  receivers: ReceiverEntity[];
  //createdAt
}

export class ReceiverEntity {
  token: string;
  status: MessagingStatus;
  message?: string;
  //sentAt
}
