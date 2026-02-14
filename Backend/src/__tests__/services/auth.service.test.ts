import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import AuthService from '../../modules/auth/auth.service';
import UserRepository from '../../modules/user/user.repo';
import AuthRepository from '../../modules/auth/auth.repo';
import User, { IUser } from '../../modules/user/user.model';
import PendingUser from '../../modules/user/pendingUser.model';
import RefreshToken from '../../modules/auth/auth.model';
import { hashToken } from '../../utils/jwt.utils';
import EmailService from '../../utils/email.service';

// Mock EmailService methods
jest.spyOn(EmailService, 'sendVerificationEmail').mockResolvedValue(undefined);

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
  await PendingUser.deleteMany({});
  jest.clearAllMocks();
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
      _family = storedToken!.family;
    });

    it('should refresh tokens successfully', async () => {
      const result = await AuthService.refreshTokens(refreshToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      // Check that a new token was created in the database
      const hashedNewToken = hashToken(result.refreshToken);
      const newStoredToken = await AuthRepository.findByHashedToken(hashedNewToken);
      expect(newStoredToken).toBeDefined();
      expect(newStoredToken!.family).toBe(_family);
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
      // Refresh to get a second token in the same family
      const refreshResult = await AuthService.refreshTokens(refreshToken);
      const refreshToken2 = refreshResult.refreshToken;

      // Use first token again (should detect as used and revoke family)
      await expect(AuthService.refreshTokens(refreshToken)).rejects.toThrow('Refresh token reuse detected');

      // Try to use second token (should fail because family was revoked and token deleted)
      await expect(AuthService.refreshTokens(refreshToken2)).rejects.toThrow('Invalid refresh token');
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

  describe('createPendingRegistration', () => {
    it('should create a pending user and send verification email', async () => {
      const result = await AuthService.createPendingRegistration('New User', 'new@example.com', 'hashed-pw');

      expect(result).toBeDefined();
      expect(result.email).toBe('new@example.com');
      expect(result.name).toBe('New User');
      expect(EmailService.sendVerificationEmail).toHaveBeenCalledWith('new@example.com', expect.any(String));
    });

    it('should replace existing pending user on re-registration', async () => {
      await AuthService.createPendingRegistration('User', 'dup@example.com', 'pw1');
      await AuthService.createPendingRegistration('User', 'dup@example.com', 'pw2');

      const count = await PendingUser.countDocuments({ email: 'dup@example.com' });
      expect(count).toBe(1);
      expect(EmailService.sendVerificationEmail).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email and create user', async () => {
      // Delete the testUser so verifyEmail can create one with the same email
      await User.deleteMany({});

      const pending = await AuthService.createPendingRegistration(
        'Verify Me',
        'verify@example.com',
        testUserData.password,
      );
      // Get the raw token used (we can't, but we can create a known one)
      // Instead, let's directly test with a known pending user
      const rawToken = 'test-raw-token-123';
      const hashedToken = hashToken(rawToken);
      await PendingUser.findByIdAndUpdate(pending._id, { verificationToken: hashedToken });

      await AuthService.verifyEmail(rawToken);

      const user = await UserRepository.findByEmail('verify@example.com');
      expect(user).toBeDefined();
      expect(user!.name).toBe('Verify Me');

      // Pending user should be cleaned up
      const pendingAfter = await PendingUser.findById(pending._id);
      expect(pendingAfter).toBeNull();
    });

    it('should throw for invalid/expired token', async () => {
      await expect(AuthService.verifyEmail('nonexistent-token')).rejects.toThrow(
        'Invalid or expired verification token',
      );
    });

    it('should throw conflict if user already exists', async () => {
      // testUser already exists with test@example.com
      const rawToken = 'conflict-token';
      const hashedToken = hashToken(rawToken);
      await PendingUser.create({
        name: 'Conflict',
        email: testUser.email,
        password: 'pw',
        verificationToken: hashedToken,
        verificationExpires: new Date(Date.now() + 86400000),
      });

      await expect(AuthService.verifyEmail(rawToken)).rejects.toThrow('User already exists');
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email for pending user', async () => {
      await AuthService.createPendingRegistration('Resend', 'resend@example.com', 'pw');
      jest.clearAllMocks();

      await AuthService.resendVerificationEmail('resend@example.com');

      expect(EmailService.sendVerificationEmail).toHaveBeenCalledWith('resend@example.com', expect.any(String));
    });

    it('should throw if email is already verified', async () => {
      // testUser is a verified user
      await expect(AuthService.resendVerificationEmail(testUser.email)).rejects.toThrow('Email is already verified');
    });

    it('should silently return for non-existent email', async () => {
      await expect(AuthService.resendVerificationEmail('nobody@example.com')).resolves.not.toThrow();
      expect(EmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });
});
