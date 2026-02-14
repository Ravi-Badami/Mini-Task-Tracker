import RefreshToken, { IRefreshToken } from './auth.model';
import mongoose from 'mongoose';

class AuthRepository {
  async createRefreshToken(
    userId: mongoose.Types.ObjectId,
    family: string,
    hashedToken: string,
    expiresAt: Date,
  ): Promise<IRefreshToken> {
    const refreshToken = new RefreshToken({
      token: hashedToken,
      userId,
      family,
      expiresAt,
    });
    return await refreshToken.save();
  }

  async findByHashedToken(hashedToken: string): Promise<IRefreshToken | null> {
    return await RefreshToken.findOne({ token: hashedToken });
  }

  async markAsUsed(tokenId: mongoose.Types.ObjectId): Promise<void> {
    await RefreshToken.findByIdAndUpdate(tokenId, { isUsed: true });
  }

  async revokeFamily(family: string): Promise<void> {
    await RefreshToken.deleteMany({ family });
  }

  async revokeAllForUser(userId: mongoose.Types.ObjectId): Promise<void> {
    await RefreshToken.deleteMany({ userId });
  }
}

export default new AuthRepository();
