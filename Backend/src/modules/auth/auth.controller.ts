import { Request, Response, NextFunction } from 'express';
import AuthService from './auth.service';
import asyncHandler from '../../utils/asyncHandler';
import ApiError from '../../utils/ApiError';
import { loginSchema, refreshTokenSchema, logoutSchema } from './auth.vaildation';

class AuthController {
  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError.badRequest(validation.error.issues[0].message);
    }

    const { email, password } = validation.data;
    const result = await AuthService.login(email, password);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validation = refreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError.badRequest(validation.error.issues[0].message);
    }

    const { refreshToken } = validation.data;
    const result = await AuthService.refreshTokens(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validation = logoutSchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError.badRequest(validation.error.issues[0].message);
    }

    const { refreshToken } = validation.data;
    await AuthService.logout(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}

export default new AuthController();
