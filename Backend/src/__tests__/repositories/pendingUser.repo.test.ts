import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import PendingUserRepository from '../../modules/user/pendingUser.repo';
import PendingUser from '../../modules/user/pendingUser.model';

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
  await PendingUser.deleteMany({});
});

describe('PendingUserRepository', () => {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password-123',
    verificationToken: 'hashed-token-abc',
    verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
  };

  describe('upsert', () => {
    it('should create a new pending user', async () => {
      const result = await PendingUserRepository.upsert(testData);

      expect(result).toBeDefined();
      expect(result.name).toBe(testData.name);
      expect(result.email).toBe(testData.email);
      expect(result.password).toBe(testData.password);
      expect(result.verificationToken).toBe(testData.verificationToken);
      expect(result._id).toBeDefined();
    });

    it('should replace existing pending user on re-register', async () => {
      // Create initial pending user
      await PendingUserRepository.upsert(testData);

      // Upsert with new data for the same email
      const updatedData = {
        ...testData,
        password: 'new-hashed-password',
        verificationToken: 'new-hashed-token',
      };

      const result = await PendingUserRepository.upsert(updatedData);

      expect(result.email).toBe(testData.email);
      expect(result.password).toBe('new-hashed-password');
      expect(result.verificationToken).toBe('new-hashed-token');

      // Should only have 1 pending user for this email
      const count = await PendingUser.countDocuments({ email: testData.email });
      expect(count).toBe(1);
    });
  });

  describe('findByToken', () => {
    it('should find pending user by hashed token', async () => {
      await PendingUserRepository.upsert(testData);

      const found = await PendingUserRepository.findByToken(testData.verificationToken);

      expect(found).toBeDefined();
      expect(found!.email).toBe(testData.email);
    });

    it('should return null for non-existent token', async () => {
      const found = await PendingUserRepository.findByToken('non-existent-token');

      expect(found).toBeNull();
    });

    it('should return null for expired token', async () => {
      const expiredData = {
        ...testData,
        verificationExpires: new Date(Date.now() - 1000), // already expired
      };
      await PendingUserRepository.upsert(expiredData);

      const found = await PendingUserRepository.findByToken(testData.verificationToken);

      expect(found).toBeNull();
    });
  });

  describe('updateToken', () => {
    it('should update verification token for existing pending user', async () => {
      await PendingUserRepository.upsert(testData);

      const newToken = 'updated-hashed-token';
      const newExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const result = await PendingUserRepository.updateToken(testData.email, newToken, newExpires);

      expect(result).toBeDefined();
      expect(result!.verificationToken).toBe(newToken);
    });

    it('should return null for non-existent email', async () => {
      const result = await PendingUserRepository.updateToken('nonexistent@example.com', 'token', new Date());

      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete pending user by ID', async () => {
      const created = await PendingUserRepository.upsert(testData);

      await PendingUserRepository.deleteById((created._id as mongoose.Types.ObjectId).toString());

      const found = await PendingUser.findById(created._id);
      expect(found).toBeNull();
    });
  });
});
