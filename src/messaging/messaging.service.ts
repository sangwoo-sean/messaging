import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {
  async sendMessage(tokens: string[], message: any): Promise<any> {
    // Simulate a delay as if we were sending a message to Firebase
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock response
    const response = tokens.map((token) => ({
      token,
      success: true,
      messageId: `mock-message-id-${token}`,
    }));

    return response;
  }
}
