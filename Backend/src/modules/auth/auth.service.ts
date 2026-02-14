import * as bcrypt from 'bcryptjs';
import UserRepository from '../user/user.repo';
import AuthRepository from './auth.repo';
import ApiError from '../../utils/ApiError';
import {
  generateAccessToken,
  generateRefreshToken,
  generateFamilyId,
  verifyRefreshToken,
  hashToken,
} from '../../utils/jwt.utils';
import jwtConfig from '../../config/jwt';
import mongoose from 'mongoose';

class AuthService {
  /**
   * Login: validate credentials, issue access + refresh tokens, create a new token family
   */
  async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const userId = (user._id as mongoose.Types.ObjectId).toString();
    const family = generateFamilyId();

    const accessToken = generateAccessToken(userId, user.email);
    const refreshToken = generateRefreshToken(userId, family);
    const hashedRefreshToken = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + jwtConfig.refreshExpiryMs);

    await AuthRepository.createRefreshToken(user._id as mongoose.Types.ObjectId, family, hashedRefreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }

  /**
   * Refresh: validate the refresh token, rotate it, and issue new tokens.
   * If a used token is presented (replay attack), revoke the entire family.
   */
  async refreshTokens(refreshToken: string) {
    // Verify the JWT signature and decode payload
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const hashedToken = hashToken(refreshToken);
    const storedToken = await AuthRepository.findByHashedToken(hashedToken);

    if (!storedToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Replay detection: if the token was already used, someone stole it
    if (storedToken.isUsed) {
      // Revoke the entire token family — both legitimate user and attacker lose access
      await AuthRepository.revokeFamily(storedToken.family);
      throw ApiError.unauthorized('Refresh token reuse detected. All sessions in this family have been revoked.');
    }

    // Check expiry
    if (storedToken.expiresAt < new Date()) {
      await AuthRepository.revokeFamily(storedToken.family);
      throw ApiError.unauthorized('Refresh token has expired');
    }

    // Mark current token as used (rotation)
    await AuthRepository.markAsUsed(storedToken._id as mongoose.Types.ObjectId);

    // Lookup user for the new access token payload
    const user = await UserRepository.findById(storedToken.userId.toString());
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    const userId = (user._id as mongoose.Types.ObjectId).toString();

    // Issue new token pair in the same family
    const newAccessToken = generateAccessToken(userId, user.email);
    const newRefreshToken = generateRefreshToken(userId, storedToken.family);
    const newHashedRefreshToken = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + jwtConfig.refreshExpiryMs);

    await AuthRepository.createRefreshToken(storedToken.userId, storedToken.family, newHashedRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout: revoke the entire token family associated with the given refresh token
   */
  async logout(refreshToken: string) {
    const hashedToken = hashToken(refreshToken);
    const storedToken = await AuthRepository.findByHashedToken(hashedToken);

    if (storedToken) {
      await AuthRepository.revokeFamily(storedToken.family);
    }
  }
}

export default new AuthService();
