import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateFamilyId,
} from '../../utils/jwt.utils';

interface JwtPayload {
  id: string;
  email?: string;
  family?: string;
  type: string;
  iat?: number;
  exp?: number;
}

describe('JWT Utilities', () => {
  const testUserId = '507f1f77bcf86cd799439011';
  const testEmail = 'test@example.com';
  const testFamily = 'test-family-123';

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateAccessToken(testUserId, testEmail);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should contain correct payload', () => {
      const token = generateAccessToken(testUserId, testEmail);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;

      expect(decoded.id).toBe(testUserId);
      expect(decoded.email).toBe(testEmail);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateRefreshToken(testUserId, testFamily);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should contain correct payload', () => {
      const token = generateRefreshToken(testUserId, testFamily);
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as any;

      expect(decoded.id).toBe(testUserId);
      expect(decoded.familyId).toBe(testFamily);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(testUserId, testFamily);
      const decoded = verifyRefreshToken(token);

      expect(decoded.id).toBe(testUserId);
      expect(decoded.familyId).toBe(testFamily);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });

    it('should throw error for access token', () => {
      const accessToken = generateAccessToken(testUserId, testEmail);
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });

  describe('hashToken', () => {
    it('should hash a token consistently', () => {
      const token = 'test-token-123';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1).not.toBe(token);
    });

    it('should produce different hashes for different tokens', () => {
      const hash1 = hashToken('token1');
      const hash2 = hashToken('token2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateFamilyId', () => {
    it('should generate a string', () => {
      const familyId = generateFamilyId();
      expect(typeof familyId).toBe('string');
      expect(familyId.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = generateFamilyId();
      const id2 = generateFamilyId();
      expect(id1).not.toBe(id2);
    });
  });
});
