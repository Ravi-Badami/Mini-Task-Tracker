import mongoose from 'mongoose';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tasktracker';

export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Redis Connection
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection error:', err);
    throw err;
  }
};

// Export mongoose for use in models
export { mongoose };
