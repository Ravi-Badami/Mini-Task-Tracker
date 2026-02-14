import { Request, Response, NextFunction } from 'express';
import UserService from './user.service';
import asyncHandler from '../../utils/asyncHandler';
import ApiError from '../../utils/ApiError';
import logger from '../../utils/logger';
import { registerSchema } from './user.vaildation';

class UserController {
  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError.badRequest(validation.error.issues[0].message);
    }

    const { name, email, password } = validation.data;
    await UserService.createUser(name, email, password);

    logger.info(`Registration initiated for: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  });
}

export default new UserController();
