import { Request, Response, NextFunction } from 'express';
import UserService from './user.service';
import asyncHandler from '../../utils/asyncHandler';
import ApiError from '../../utils/ApiError';
import logger from '../../utils/logger';
import { registerSchema, loginSchema } from './user.vaildation';

class UserController {
  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError.badRequest(validation.error.issues[0].message);
    }

    const { name, email, password } = validation.data;
    const user = await UserService.createUser(name, email, password);

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({ success: true, data: user });
  });

  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError.badRequest(validation.error.issues[0].message);
    }

    const { email, password } = validation.data;
    const { user, token } = await UserService.loginUser(email, password);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({ success: true, data: { user, token } });
  });
}

export default new UserController();
