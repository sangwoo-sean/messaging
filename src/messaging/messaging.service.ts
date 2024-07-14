import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {
  async sendMessage(
    tokens: string[],
    message: any,
  ): Promise<{ result: number; message: string; token: string }[]> {
    // Simulate a delay as if we were sending a message to Firebase
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock response
    const response = tokens.map((token) => ({
      token,
      result: 200, // or 400
      message: `success`, // or "Invalid token"
    }));

    return response;
  }
}
