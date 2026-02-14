import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import AuthRepository from '../../modules/auth/auth.repo';
import RefreshToken from '../../modules/auth/auth.model';

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
  await RefreshToken.deleteMany({});
});

describe('AuthRepository', () => {
  const testUserId = new mongoose.Types.ObjectId();
  const testFamily = 'test-family-123';
  const testHashedToken = 'hashed-token-123';
  const testExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  describe('createRefreshToken', () => {
    it('should create a refresh token', async () => {
      const token = await AuthRepository.createRefreshToken(testUserId, testFamily, testHashedToken, testExpiresAt);

      expect(token).toBeDefined();
      expect(token.token).toBe(testHashedToken);
      expect(token.userId.toString()).toBe(testUserId.toString());
      expect(token.family).toBe(testFamily);
      expect(token.isUsed).toBe(false);
      expect(token.expiresAt).toEqual(testExpiresAt);
    });
  });

  describe('findByHashedToken', () => {
    it('should find token by hashed token', async () => {
      await AuthRepository.createRefreshToken(testUserId, testFamily, testHashedToken, testExpiresAt);

      const foundToken = await AuthRepository.findByHashedToken(testHashedToken);

      expect(foundToken).toBeDefined();
      expect(foundToken!.token).toBe(testHashedToken);
      expect(foundToken!.family).toBe(testFamily);
    });

    it('should return null for non-existent token', async () => {
      const foundToken = await AuthRepository.findByHashedToken('non-existent-token');

      expect(foundToken).toBeNull();
    });
  });

  describe('markAsUsed', () => {
    it('should mark token as used', async () => {
      const token = await AuthRepository.createRefreshToken(testUserId, testFamily, testHashedToken, testExpiresAt);

      await AuthRepository.markAsUsed(token._id);

      const updatedToken = await AuthRepository.findByHashedToken(testHashedToken);
      expect(updatedToken!.isUsed).toBe(true);
    });
  });

  describe('revokeFamily', () => {
    it('should revoke all tokens in a family', async () => {
      // Create multiple tokens in the same family
      await AuthRepository.createRefreshToken(testUserId, testFamily, 'token1', testExpiresAt);
      await AuthRepository.createRefreshToken(testUserId, testFamily, 'token2', testExpiresAt);

      await AuthRepository.revokeFamily(testFamily);

      const token1 = await AuthRepository.findByHashedToken('token1');
      const token2 = await AuthRepository.findByHashedToken('token2');

      expect(token1).toBeNull();
      expect(token2).toBeNull();
    });

    it('should not affect tokens in other families', async () => {
      await AuthRepository.createRefreshToken(testUserId, testFamily, testHashedToken, testExpiresAt);
      await AuthRepository.createRefreshToken(testUserId, 'other-family', 'other-token', testExpiresAt);

      await AuthRepository.revokeFamily(testFamily);

      const token = await AuthRepository.findByHashedToken(testHashedToken);
      const otherToken = await AuthRepository.findByHashedToken('other-token');

      expect(token).toBeNull();
      expect(otherToken).toBeDefined();
    });
  });

  describe('revokeAllForUser', () => {
    it('should revoke all tokens for a user', async () => {
      const otherUserId = new mongoose.Types.ObjectId();

      await AuthRepository.createRefreshToken(testUserId, testFamily, testHashedToken, testExpiresAt);
      await AuthRepository.createRefreshToken(otherUserId, 'other-family', 'other-token', testExpiresAt);

      await AuthRepository.revokeAllForUser(testUserId);

      const userToken = await AuthRepository.findByHashedToken(testHashedToken);
      const otherUserToken = await AuthRepository.findByHashedToken('other-token');

      expect(userToken).toBeNull();
      expect(otherUserToken).toBeDefined();
    });
  });
});
