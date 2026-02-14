import { Request, Response, NextFunction } from 'express';
import AuthService from './auth.service';
import UserRepository from '../user/user.repo';
import asyncHandler from '../../utils/asyncHandler';
import ApiError from '../../utils/ApiError';
import logger from '../../utils/logger';
import {
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from './auth.vaildation';

class AuthController {
  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError.badRequest(validation.error.issues[0].message);
    }

    const { email, password } = validation.data;
    const result = await AuthService.login(email, password);

    logger.info(`User logged in successfully: ${email}`);

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

    logger.info('Tokens refreshed successfully');

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

    logger.info('User logged out successfully');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });
  verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validation = verifyEmailSchema.safeParse(req.query);
    if (!validation.success) {
      res
        .status(400)
        .send(this.verificationPage('error', 'Invalid verification link. Please check your email and try again.'));
      return;
    }

    const { token } = validation.data;

    try {
      await AuthService.verifyEmail(token);
      logger.info('Email verified successfully');
      res
        .status(200)
        .send(this.verificationPage('success', 'Your email has been verified successfully! You can now log in.'));
    } catch (error: any) {
      const message = error?.message || 'Verification failed. The link may be expired or invalid.';
      res.status(400).send(this.verificationPage('error', message));
    }
  });

  private verificationPage(status: 'success' | 'error', message: string): string {
    const isSuccess = status === 'success';
    const bgColor = isSuccess ? '#f0fdf4' : '#fef2f2';
    const icon = isSuccess
      ? '<svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
      : '<svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#ef4444"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';

    const redirectScript = isSuccess
      ? `<script>
          let seconds = 3;
          const el = document.getElementById('countdown');
          const interval = setInterval(() => {
            seconds--;
            if (el) el.textContent = seconds;
            if (seconds <= 0) {
              clearInterval(interval);
              window.location.href = 'http://localhost:3000/?verified=true';
            }
          }, 1000);
        </script>`
      : '';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - Task Tracker</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; }
          .card { background: white; border-radius: 12px; padding: 40px; max-width: 440px; width: 90%; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .icon { width: 72px; height: 72px; border-radius: 50%; background: ${bgColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
          h1 { font-size: 22px; color: #111827; margin-bottom: 8px; }
          p { color: #6b7280; font-size: 15px; line-height: 1.5; }
          .redirect { margin-top: 16px; font-size: 13px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">${icon}</div>
          <h1>${isSuccess ? 'Email Verified!' : 'Verification Failed'}</h1>
          <p>${message}</p>
          ${isSuccess ? '<p class="redirect">Redirecting to login in <span id="countdown">3</span> seconds...</p>' : ''}
        </div>
        ${redirectScript}
      </body>
      </html>
    `;
  }

  resendVerification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validation = resendVerificationSchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError.badRequest(validation.error.issues[0].message);
    }

    const { email } = validation.data;
    await AuthService.resendVerificationEmail(email);

    logger.info(`Verification email resent to: ${email}`);

    res.status(200).json({
      success: true,
      message: 'If your email is registered and unverified, a verification email has been sent',
    });
  });
  checkVerificationStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      throw ApiError.badRequest('Email is required');
    }

    const user = await UserRepository.findByEmail(email);

    res.status(200).json({
      success: true,
      verified: !!user,
    });
  });
}

export default new AuthController();
