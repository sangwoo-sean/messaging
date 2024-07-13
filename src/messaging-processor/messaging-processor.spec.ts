import { Test, TestingModule } from '@nestjs/testing';
import { MessagingProcessor } from './messaging-processor';

describe('MessagingProcessor', () => {
  let provider: MessagingProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagingProcessor],
    }).compile();

    provider = module.get<MessagingProcessor>(MessagingProcessor);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
