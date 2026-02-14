/**
 * Jest Test Setup
 * This file configures mocks for Redis and other dependencies
 * It runs before all tests
 */

// Mock Redis using redis-mock
// This provides a fully functional Redis mock with actual Redis commands implementation
jest.mock('../config/redis', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const redisMock = require('redis-mock');
  const client = redisMock.createClient();

  // Wrap the client to match the modern redis client API
  return {
    __esModule: true,
    default: {
      get: (key: string) => {
        return new Promise((resolve, reject) => {
          client.get(key, (err: Error | null, reply: string | null) => {
            if (err) reject(err);
            else resolve(reply);
          });
        });
      },
      setEx: (key: string, seconds: number, value: string) => {
        return new Promise((resolve, reject) => {
          client.setex(key, seconds, value, (err: Error | null) => {
            if (err) reject(err);
            else resolve('OK');
          });
        });
      },
      del: (key: string) => {
        return new Promise((resolve, reject) => {
          client.del(key, (err: Error | null, reply: number) => {
            if (err) reject(err);
            else resolve(reply);
          });
        });
      },
      // Add other Redis commands as needed
      flushAll: () => {
        return new Promise((resolve, reject) => {
          client.flushall((err: Error | null) => {
            if (err) reject(err);
            else resolve('OK');
          });
        });
      },
    },
  };
});

// Mock nodemailer to prevent actual email sending during tests
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    verify: jest.fn().mockResolvedValue(true),
    close: jest.fn(),
  }),
  getTestMessageUrl: jest.fn().mockReturnValue('http://ethereal.email/message/test-id'),
}));

// Set test environment variable
process.env.NODE_ENV = 'test';
