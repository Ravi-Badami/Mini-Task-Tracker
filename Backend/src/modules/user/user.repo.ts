import User, { IUser } from './user.model';

class UserRepository {
  async create(userData: { name: string; email: string; password: string }): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async findByVerificationToken(hashedToken: string): Promise<IUser | null> {
    return await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });
  }

  async setVerificationToken(userId: string, hashedToken: string, expiresAt: Date): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: expiresAt,
    });
  }
}

export default new UserRepository();
