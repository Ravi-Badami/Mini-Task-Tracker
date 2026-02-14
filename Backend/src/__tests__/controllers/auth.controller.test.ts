import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AuthController from '../../modules/auth/auth.controller';
import AuthService from '../../modules/auth/auth.service';
import UserRepository from '../../modules/user/user.repo';

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockReq.body = loginData;

      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          name: 'Test User',
          email: loginData.email,
        },
      };

      const loginSpy = jest.spyOn(AuthService, 'login').mockResolvedValue(mockResult);

      await AuthController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(loginSpy).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
      expect(mockNext).not.toHaveBeenCalled();

      loginSpy.mockRestore();
    });

    it('should handle validation errors', async () => {
      mockReq.body = { email: 'invalid-email', password: '' };

      await AuthController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          statusCode: 400,
        }),
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const refreshData = {
        refreshToken: 'valid-refresh-token',
      };

      mockReq.body = refreshData;

      const mockResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      const refreshSpy = jest.spyOn(AuthService, 'refreshTokens').mockResolvedValue(mockResult);

      await AuthController.refresh(mockReq as Request, mockRes as Response, mockNext);

      expect(refreshSpy).toHaveBeenCalledWith(refreshData.refreshToken);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
      expect(mockNext).not.toHaveBeenCalled();

      refreshSpy.mockRestore();
    });

    it('should handle validation errors', async () => {
      mockReq.body = { refreshToken: '' };

      await AuthController.refresh(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          statusCode: 400,
        }),
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const logoutData = {
        refreshToken: 'refresh-token',
      };

      mockReq.body = logoutData;

      const logoutSpy = jest.spyOn(AuthService, 'logout').mockResolvedValue();

      await AuthController.logout(mockReq as Request, mockRes as Response, mockNext);

      expect(logoutSpy).toHaveBeenCalledWith(logoutData.refreshToken);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
      expect(mockNext).not.toHaveBeenCalled();

      logoutSpy.mockRestore();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const verifyData = {
        token: 'valid-verification-token',
      };

      mockReq.query = verifyData;

      const verifySpy = jest.spyOn(AuthService, 'verifyEmail').mockResolvedValue();

      await AuthController.verifyEmail(mockReq as Request, mockRes as Response, mockNext);

      expect(verifySpy).toHaveBeenCalledWith(verifyData.token);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      // VerifyEmail now returns HTML, checking that send was called
      expect(mockRes.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();

      verifySpy.mockRestore();
    });

    it('should handle validation errors', async () => {
      mockReq.query = { token: '' };

      await AuthController.verifyEmail(mockReq as Request, mockRes as Response, mockNext);

      // VerifyEmail handles validation errors by sending HTML error page
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('resendVerification', () => {
    it('should resend verification email successfully', async () => {
      const resendData = {
        email: 'test@example.com',
      };

      mockReq.body = resendData;

      const resendSpy = jest.spyOn(AuthService, 'resendVerificationEmail').mockResolvedValue();

      await AuthController.resendVerification(mockReq as Request, mockRes as Response, mockNext);

      expect(resendSpy).toHaveBeenCalledWith(resendData.email);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'If your email is registered and unverified, a verification email has been sent',
      });
      expect(mockNext).not.toHaveBeenCalled();

      resendSpy.mockRestore();
    });
  });

  describe('checkVerificationStatus', () => {
    it('should return verified: true when user exists', async () => {
      mockReq.query = { email: 'test@example.com' };

      const findByEmailSpy = jest.spyOn(UserRepository, 'findByEmail').mockResolvedValue({ _id: 'user-id' } as never);

      await AuthController.checkVerificationStatus(mockReq as Request, mockRes as Response, mockNext);

      expect(findByEmailSpy).toHaveBeenCalledWith('test@example.com');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, verified: true });

      findByEmailSpy.mockRestore();
    });

    it('should return verified: false when user does not exist', async () => {
      mockReq.query = { email: 'unknown@example.com' };

      const findByEmailSpy = jest.spyOn(UserRepository, 'findByEmail').mockResolvedValue(null);

      await AuthController.checkVerificationStatus(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true, verified: false });

      findByEmailSpy.mockRestore();
    });

    it('should throw 400 when email is missing', async () => {
      mockReq.query = {};

      await AuthController.checkVerificationStatus(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Email is required',
        }),
      );
    });
  });

  describe('error propagation', () => {
    it('should pass login service errors to next', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password' };
      const error = new Error('Service failed');
      const loginSpy = jest.spyOn(AuthService, 'login').mockRejectedValue(error);

      await AuthController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      loginSpy.mockRestore();
    });

    it('should pass refresh service errors to next', async () => {
      mockReq.body = { refreshToken: 'some-token' };
      const error = new Error('Refresh failed');
      const refreshSpy = jest.spyOn(AuthService, 'refreshTokens').mockRejectedValue(error);

      await AuthController.refresh(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      refreshSpy.mockRestore();
    });
  });
});
