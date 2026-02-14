import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware, { AuthRequest } from '../../middleware/auth.middleware';
import { generateAccessToken } from '../../utils/jwt.utils';

// Redis is mocked globally in setup.ts using redis-mock

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should set req.user and call next() for a valid token', () => {
    const userId = '507f1f77bcf86cd799439011';
    const email = 'test@example.com';
    const token = generateAccessToken(userId, email);

    mockReq.headers = { authorization: `Bearer ${token}` };

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toBeDefined();
    expect(mockReq.user!.id).toBe(userId);
    expect(mockReq.user!.email).toBe(email);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should throw 401 when Authorization header is missing', () => {
    mockReq.headers = {};

    expect(() => {
      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);
    }).toThrow(
      expect.objectContaining({
        statusCode: 401,
        message: 'Access token is missing',
      }),
    );

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw 401 when Authorization header has no Bearer prefix', () => {
    mockReq.headers = { authorization: 'Basic some-token' };

    expect(() => {
      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);
    }).toThrow(
      expect.objectContaining({
        statusCode: 401,
        message: 'Access token is missing',
      }),
    );

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw 401 for an invalid token', () => {
    mockReq.headers = { authorization: 'Bearer invalid-token-here' };

    expect(() => {
      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);
    }).toThrow(
      expect.objectContaining({
        statusCode: 401,
        message: 'Invalid or expired access token',
      }),
    );

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw 401 for an expired token', () => {
    // Create a token with a past expiry by using jwt directly
    const expiredToken = jwt.sign({ id: 'user-id', email: 'test@example.com' }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '0s',
    });

    mockReq.headers = { authorization: `Bearer ${expiredToken}` };

    expect(() => {
      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);
    }).toThrow(
      expect.objectContaining({
        statusCode: 401,
        message: 'Invalid or expired access token',
      }),
    );

    expect(mockNext).not.toHaveBeenCalled();
  });
});
