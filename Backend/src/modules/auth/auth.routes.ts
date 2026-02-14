import { Router } from 'express';
import AuthController from './auth.controller';

const router = Router();

router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);
router.get('/check-verification-status', AuthController.checkVerificationStatus);

export default router;
