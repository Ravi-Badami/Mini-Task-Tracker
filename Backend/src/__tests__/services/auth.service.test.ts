/* eslint-disable @typescript-eslint/no-require-imports */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import AuthService from '../../modules/auth/auth.service';
import UserRepository from '../../modules/user/user.repo';
import AuthRepository from '../../modules/auth/auth.repo';
import User, { IUser } from '../../modules/user/user.model';
import RefreshToken from '../../modules/auth/auth.model';
import { hashToken } from '../../utils/jwt.utils';

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
  await RefreshToken.deleteMany({});
});

describe('AuthService', () => {
  const testUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
  };

  let testUser: IUser;

  beforeEach(async () => {
    testUser = await UserRepository.create(testUserData);
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const result = await AuthService.login('test@example.com', 'password');

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
    });

    it('should throw error for non-existent user', async () => {
      await expect(AuthService.login('nonexistent@example.com', 'password')).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw error for wrong password', async () => {
      await expect(AuthService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for unverified email', async () => {
      // Create user without email verification
      const _unverifiedUser = await UserRepository.create({
        ...testUserData,
        email: 'unverified@example.com',
        isEmailVerified: false,
      });

      await expect(AuthService.login('unverified@example.com', 'password')).rejects.toThrow(
        'Please verify your email before logging in',
      );
    });
  });

  describe('refreshTokens', () => {
    let refreshToken: string;
    let _family: string;

    beforeEach(async () => {
      // Login to get a refresh token
      const loginResult = await AuthService.login('test@example.com', 'password');
      refreshToken = loginResult.refreshToken;

      // Get the family from the token
      const hashedToken = hashToken(refreshToken);
      const storedToken = await AuthRepository.findByHashedToken(hashedToken);
      family = storedToken!.family;
    });

    it('should refresh tokens successfully', async () => {
      const result = await AuthService.refreshTokens(refreshToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe(refreshToken); // Should be rotated
    });

    it('should mark old token as used', async () => {
      const hashedOldToken = hashToken(refreshToken);
      await AuthService.refreshTokens(refreshToken);

      const oldToken = await AuthRepository.findByHashedToken(hashedOldToken);
      expect(oldToken!.isUsed).toBe(true);
    });

    it('should throw error for invalid token', async () => {
      await expect(AuthService.refreshTokens('invalid-token')).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw error for used token (replay attack)', async () => {
      // Use the token once
      await AuthService.refreshTokens(refreshToken);

      // Try to use it again
      await expect(AuthService.refreshTokens(refreshToken)).rejects.toThrow('Refresh token reuse detected');
    });

    it('should revoke entire family on replay attack', async () => {
      // Create another token in the same family
      const loginResult2 = await AuthService.login('test@example.com', 'password');
      const refreshToken2 = loginResult2.refreshToken;

      // Use first token
      await AuthService.refreshTokens(refreshToken);

      // Try to use second token (should fail due to family revocation)
      await expect(AuthService.refreshTokens(refreshToken2)).rejects.toThrow('Refresh token reuse detected');
    });
  });

  describe('logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const loginResult = await AuthService.login('test@example.com', 'password');
      refreshToken = loginResult.refreshToken;
    });

    it('should logout successfully', async () => {
      await expect(AuthService.logout(refreshToken)).resolves.not.toThrow();

      // Verify token family is revoked
      const hashedToken = hashToken(refreshToken);
      const storedToken = await AuthRepository.findByHashedToken(hashedToken);
      expect(storedToken).toBeNull(); // Should be deleted
    });

    it('should handle non-existent token gracefully', async () => {
      await expect(AuthService.logout('non-existent-token')).resolves.not.toThrow();
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email', async () => {
      // Mock the email service
      const mockEmailService = {
        sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      };

      // Temporarily replace the email service import
      const _originalModule = jest.requireActual('../utils/email.service');
      jest.doMock('../utils/email.service', () => mockEmailService);

      // Re-import to get the mocked version
      const AuthServiceWithMock = require('../modules/auth/auth.service').default;

      await AuthServiceWithMock.sendVerificationEmail(testUser._id.toString(), testUser.email);

      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        testUser.email,
        expect.any(String), // Raw token
      );
    });
  });
});
