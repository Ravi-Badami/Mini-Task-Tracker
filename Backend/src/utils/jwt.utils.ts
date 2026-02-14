import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import jwtConfig from '../config/jwt';

/**
 * Generate a unique token family ID (UUID v4)
 */
export const generateFamilyId = (): string => uuidv4();

/**
 * Generate a short-lived access token
 */
export const generateAccessToken = (userId: string, email: string): string => {
  const options: SignOptions = { expiresIn: jwtConfig.accessExpire as jwt.SignOptions['expiresIn'] };
  return jwt.sign({ id: userId, email }, jwtConfig.secret, options);
};

/**
 * Generate a signed refresh token containing userId and familyId
 */
export const generateRefreshToken = (userId: string, familyId: string): string => {
  const options: SignOptions = { expiresIn: jwtConfig.refreshExpire as jwt.SignOptions['expiresIn'] };
  return jwt.sign({ id: userId, familyId }, jwtConfig.refreshSecret, options);
};

/**
 * Verify and decode an access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtConfig.secret) as JwtPayload;
};

/**
 * Verify and decode a refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
};

/**
 * Generate a cryptographically random opaque token string
 */
export const generateOpaqueToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Hash a token using SHA-256 (for secure storage in DB)
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
