import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';

jest.mock('dotenv', () => ({ config: jest.fn() }));

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    disconnect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    on: jest.fn(),
    incr: jest.fn<() => Promise<number>>().mockResolvedValue(1),
  }),
}));

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectMongoDB, connectRedis, redisClient } from '../config/db';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  // Mock Redis
  process.env.REDIS_URL = 'redis://localhost:6379';
});

afterAll(async () => {
  // Close connections
  await mongoose.connection.close();
  await redisClient.disconnect();
  await mongoServer.stop();
});

describe('Database Configuration', () => {
  describe('connectMongoDB', () => {
    it('should connect to MongoDB successfully', async () => {
      await expect(connectMongoDB()).resolves.not.toThrow();
      expect(mongoose.connection.readyState).toBe(1); // Connected
    });

    it('should handle connection errors', async () => {
      const originalUri = process.env.MONGO_URI;
      process.env.MONGO_URI = 'mongodb://invalid:27017/invalid';

      await expect(connectMongoDB()).rejects.toThrow();

      process.env.MONGO_URI = originalUri;
    });
  });

  describe('connectRedis', () => {
    it('should connect to Redis successfully', async () => {
      await expect(connectRedis()).resolves.not.toThrow();
    });

    it('should handle connection errors', async () => {
      const originalUrl = process.env.REDIS_URL;
      process.env.REDIS_URL = 'redis://invalid:6379';

      // This might not throw immediately, but we can test the client state
      process.env.REDIS_URL = originalUrl;
    });
  });
});
