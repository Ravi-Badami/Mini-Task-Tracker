import { Request, Response } from 'express';
import AuthController from '../../modules/auth/auth.controller';
import AuthService from '../../modules/auth/auth.service';

describe('AuthController', () => {
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
        user: { id: 'user-id', name: 'Test User', email: loginData.email },
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
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Email verified successfully',
      });
      expect(mockNext).not.toHaveBeenCalled();

      verifySpy.mockRestore();
    });

    it('should handle validation errors', async () => {
      mockReq.query = { token: '' };

      await AuthController.verifyEmail(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          statusCode: 400,
        }),
      );
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
});
