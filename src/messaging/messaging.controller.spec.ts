import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import * as path from 'path';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';

describe('MessagingController (e2e)', () => {
  let app: INestApplication;
  const mockQueue: Queue = {
    add: jest.fn(),
    process: jest.fn(),
    // Add other methods you may use
  } as unknown as Queue;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getQueueToken('message-queue'))
      .useValue(mockQueue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/messaging/send (POST) - should handle tokens in request body', async () => {
    const response = await request(app.getHttpServer())
      .post('/messaging/send')
      .send({
        tokens: ['token1', 'token2', 'token3'],
        message: { title: 'Test', body: 'This is a test message' },
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'queued');
  });

  it('/messaging/send (POST) - should handle CSV file upload', async () => {
    const response = await request(app.getHttpServer())
      .post('/messaging/send')
      .field(
        'message',
        JSON.stringify({ title: 'Test', body: 'This is a test message' }),
      )
      .attach('file', path.join(__dirname, 'test-files', 'test.csv'));

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'queued');
  });

  it('/messaging/send (POST) - should handle XLSX file upload', async () => {
    const response = await request(app.getHttpServer())
      .post('/messaging/send')
      .field(
        'message',
        JSON.stringify({ title: 'Test', body: 'This is a test message' }),
      )
      .attach('file', path.join(__dirname, 'test-files', 'test.xlsx'));

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'queued');
  });

  it('/messaging/send-multiple (POST) - should handle multiple file uploads', async () => {
    const response = await request(app.getHttpServer())
      .post('/messaging/send-multiple')
      .field(
        'message',
        JSON.stringify({ title: 'Test', body: 'This is a test message' }),
      )
      .attach('files', path.join(__dirname, 'test-files', 'test.csv'))
      .attach('files', path.join(__dirname, 'test-files', 'test.xlsx'));

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'queued');
  });

  it('/messaging/send-multiple (POST) - should fail if any file upload fails', async () => {
    const response = await request(app.getHttpServer())
      .post('/messaging/send-multiple')
      .field(
        'message',
        JSON.stringify({ title: 'Test', body: 'This is a test message' }),
      )
      .attach('files', path.join(__dirname, 'test-files', 'test.csv'))
      .attach('files', path.join(__dirname, 'test-files', 'invalid.txt')); // Assume invalid.txt is an invalid file

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      'message',
      'Failed to parse one or more files.',
    );
  });
});
