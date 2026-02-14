import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import ApiError from '../../utils/ApiError';

describe('asyncHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should call the handler function', async () => {
    const handler = asyncHandler(async (_req, _res, _next) => {
      _res.status(200).json({ success: true });
    });

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should catch and pass errors to next middleware', async () => {
    const testError = new Error('Test error');
    const handler = asyncHandler(async (_req, _res, next) => {
      throw testError;
    });

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(testError);
  });

  it('should handle ApiError instances', async () => {
    const apiError = ApiError.badRequest('Validation failed');
    const handler = asyncHandler(async (_req, _res, next) => {
      throw apiError;
    });

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(apiError);
  });

  it('should handle async errors', async () => {
    const handler = asyncHandler(async (_req, _res, _next) => {
      await Promise.reject(new Error('Async error'));
    });

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle synchronous errors', async () => {
    const handler = asyncHandler((_req, _res, _next) => {
      throw new Error('Sync error');
    });

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});
