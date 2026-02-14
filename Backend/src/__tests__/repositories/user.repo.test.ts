import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserRepository from '../../modules/user/user.repo';
import User from '../../modules/user/user.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('UserRepository', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword123',
  };

  describe('create', () => {
    it('should create a new user', async () => {
      const user = await UserRepository.create(testUser);

      expect(user).toBeDefined();
      expect(user.name).toBe(testUser.name);
      expect(user.email).toBe(testUser.email);
      expect(user.password).toBe(testUser.password);
      expect(user._id).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    it('should throw error for duplicate email', async () => {
      await UserRepository.create(testUser);

      await expect(UserRepository.create(testUser)).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      await UserRepository.create(testUser);

      const foundUser = await UserRepository.findByEmail(testUser.email);

      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe(testUser.email);
      expect(foundUser!.name).toBe(testUser.name);
    });

    it('should return null for non-existent email', async () => {
      const foundUser = await UserRepository.findByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const createdUser = await UserRepository.create(testUser);

      const foundUser = await UserRepository.findById(createdUser._id.toString());

      expect(foundUser).toBeDefined();
      expect(foundUser!._id.toString()).toBe(createdUser._id.toString());
      expect(foundUser!.email).toBe(testUser.email);
    });

    it('should return null for non-existent ID', async () => {
      const foundUser = await UserRepository.findById('507f1f77bcf86cd799439011');

      expect(foundUser).toBeNull();
    });

    it('should return null for invalid ID', async () => {
      await expect(UserRepository.findById('invalid-id')).rejects.toThrow('Cast to ObjectId failed');
    });
  });
});
