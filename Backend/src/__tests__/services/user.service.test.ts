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

      // Mock the auth service to avoid actual email sending
      const createPendingRegistrationSpy = jest.spyOn(AuthService, 'createPendingRegistration').mockResolvedValue({
        _id: 'pending-user-id',
        name: userData.name,
        email: userData.email,
        password: 'hashed-password',
        verificationToken: 'token',
        verificationExpires: new Date(),
        createdAt: new Date(),
      } as any);

      const user = await UserService.createUser(userData.name, userData.email, userData.password);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(createPendingRegistrationSpy).toHaveBeenCalledWith(userData.name, userData.email, expect.any(String));

      createPendingRegistrationSpy.mockRestore();
    });

    it('should throw error for existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // First call succeeds
      const createPendingRegistrationSpy = jest
        .spyOn(AuthService, 'createPendingRegistration')
        .mockResolvedValueOnce({
          _id: 'pending-user-id',
          name: userData.name,
          email: userData.email,
          password: 'hashed-password',
          verificationToken: 'token',
          verificationExpires: new Date(),
          createdAt: new Date(),
        } as any)
        .mockRejectedValueOnce(new Error('User already exists'));

      await UserService.createUser(userData.name, userData.email, userData.password);

      await expect(UserService.createUser('Another User', userData.email, 'differentpassword')).rejects.toThrow(
        'User already exists',
      );

      createPendingRegistrationSpy.mockRestore();
    });

    it('should hash the password', async () => {
      const password = 'password123';

      // Mock auth service
      jest.spyOn(AuthService, 'createPendingRegistration').mockResolvedValue({
        _id: 'pending-user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        verificationToken: 'token',
        verificationExpires: new Date(),
        createdAt: new Date(),
      } as any);

      const user = await UserService.createUser('Test User', 'test@example.com', password);

      expect(user.password).not.toBe(password);
      expect(typeof user.password).toBe('string');
    });
  });
});
