import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserService from '../../modules/user/user.service';
import UserRepository from '../../modules/user/user.repo';
import AuthService from '../../modules/auth/auth.service';
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

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock the email service to avoid actual email sending
      const sendVerificationEmailSpy = jest.spyOn(AuthService, 'sendVerificationEmail').mockResolvedValue();

      const user = await UserService.createUser(userData.name, userData.email, userData.password);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(sendVerificationEmailSpy).toHaveBeenCalledWith(user._id.toString(), user.email);

      sendVerificationEmailSpy.mockRestore();
    });

    it('should throw error for existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      await UserService.createUser(userData.name, userData.email, userData.password);

      await expect(UserService.createUser('Another User', userData.email, 'differentpassword')).rejects.toThrow(
        'User already exists',
      );
    });

    it('should hash the password', async () => {
      const password = 'password123';

      // Mock email service
      jest.spyOn(AuthService, 'sendVerificationEmail').mockResolvedValue();

      const user = await UserService.createUser('Test User', 'test@example.com', password);

      expect(user.password).not.toBe(password);
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password'
      await UserRepository.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      });
    });

    it('should login user with correct credentials', async () => {
      const result = await UserService.loginUser('test@example.com', 'password');

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should throw error for non-existent email', async () => {
      await expect(UserService.loginUser('nonexistent@example.com', 'password')).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw error for wrong password', async () => {
      await expect(UserService.loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });
});
