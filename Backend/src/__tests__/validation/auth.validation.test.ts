import {
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from '../../modules/auth/auth.vaildation';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required');
      }
    });

    it('should reject missing fields', () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('refreshTokenSchema', () => {
    it('should validate valid refresh token', () => {
      const result = refreshTokenSchema.safeParse({
        refreshToken: 'some-valid-token',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty refresh token', () => {
      const result = refreshTokenSchema.safeParse({
        refreshToken: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Refresh token is required');
      }
    });

    it('should reject missing refreshToken field', () => {
      const result = refreshTokenSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('logoutSchema', () => {
    it('should validate valid logout data', () => {
      const result = logoutSchema.safeParse({
        refreshToken: 'some-token',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty refresh token', () => {
      const result = logoutSchema.safeParse({
        refreshToken: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Refresh token is required');
      }
    });
  });

  describe('verifyEmailSchema', () => {
    it('should validate valid verification token', () => {
      const result = verifyEmailSchema.safeParse({
        token: 'abc123def456',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const result = verifyEmailSchema.safeParse({
        token: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Verification token is required');
      }
    });

    it('should reject missing token', () => {
      const result = verifyEmailSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('resendVerificationSchema', () => {
    it('should validate valid email', () => {
      const result = resendVerificationSchema.safeParse({
        email: 'user@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = resendVerificationSchema.safeParse({
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });

    it('should reject missing email', () => {
      const result = resendVerificationSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
