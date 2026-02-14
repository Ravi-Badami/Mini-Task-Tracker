import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { verifyAccessToken } from '../utils/jwt.utils';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access token is missing');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
};

export default authMiddleware;
