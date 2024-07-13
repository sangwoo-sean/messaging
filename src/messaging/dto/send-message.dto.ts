export class SendMessageDto {
  tokens?: string[];
  message: {
    title: string;
    body: string;
  };
}
