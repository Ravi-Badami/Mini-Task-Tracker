import { Request, Response } from 'express';
import UserController from '../../modules/user/user.controller';
import UserService from '../../modules/user/user.service';
import ApiError from '../../utils/ApiError';
import { IUser } from '../../modules/user/user.model';

describe('UserController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockReq.body = userData;

      const mockUser = {
        _id: 'user-id',
        name: userData.name,
        email: userData.email,
        password: 'hashed-password',
      };

      const createUserSpy = jest.spyOn(UserService, 'createUser').mockResolvedValue(mockUser as IUser);

      await UserController.register(mockReq as Request, mockRes as Response, mockNext);

      expect(createUserSpy).toHaveBeenCalledWith(userData.name, userData.email, userData.password);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockUser });
      expect(mockNext).not.toHaveBeenCalled();

      createUserSpy.mockRestore();
    });

    it('should handle validation errors', async () => {
      mockReq.body = { name: '', email: 'invalid-email', password: '123' };

      await UserController.register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          statusCode: 400,
        }),
      );
    });

    it('should handle service errors', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockReq.body = userData;

      const createUserSpy = jest
        .spyOn(UserService, 'createUser')
        .mockRejectedValue(ApiError.conflict('User already exists'));

      await UserController.register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User already exists',
          statusCode: 409,
        }),
      );

      createUserSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockReq.body = loginData;

      const mockResult = {
        user: { id: 'user-id', name: 'Test User', email: loginData.email },
        token: 'jwt-token',
      };

      const loginUserSpy = jest.spyOn(UserService, 'loginUser').mockResolvedValue(mockResult);

      await UserController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(loginUserSpy).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
      expect(mockNext).not.toHaveBeenCalled();

      loginUserSpy.mockRestore();
    });

    it('should handle validation errors', async () => {
      mockReq.body = { email: 'invalid-email', password: '' };

      await UserController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          statusCode: 400,
        }),
      );
    });

    it('should handle service errors', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockReq.body = loginData;

      const loginUserSpy = jest
        .spyOn(UserService, 'loginUser')
        .mockRejectedValue(ApiError.unauthorized('Invalid email or password'));

      await UserController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid email or password',
          statusCode: 401,
        }),
      );

      loginUserSpy.mockRestore();
    });
  });
});
