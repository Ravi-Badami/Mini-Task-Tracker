import PendingUser, { IPendingUser } from './pendingUser.model';

class PendingUserRepository {
  /**
   * Upsert a pending registration by email.
   * If one already exists for this email, it gets fully replaced (new token, new password, etc.),
   * which invalidates the old verification link.
   */
  async upsert(data: {
    name: string;
    email: string;
    password: string;
    verificationToken: string;
    verificationExpires: Date;
  }): Promise<IPendingUser> {
    return (await PendingUser.findOneAndUpdate(
      { email: data.email },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )) as IPendingUser;
  }

  /**
   * Find a pending user by their hashed verification token (only if not expired)
   */
  async findByToken(hashedToken: string): Promise<IPendingUser | null> {
    return await PendingUser.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: new Date() },
    });
  }

  /**
   * Update only the verification token for an existing pending user.
   * Returns null if no pending user exists for this email.
   */
  async updateToken(email: string, verificationToken: string, verificationExpires: Date): Promise<IPendingUser | null> {
    return await PendingUser.findOneAndUpdate(
      { email },
      { $set: { verificationToken, verificationExpires } },
      { new: true },
    );
  }

  /**
   * Delete a pending user by ID (after successful verification)
   */
  async deleteById(id: string): Promise<void> {
    await PendingUser.findByIdAndDelete(id);
  }
}

export default new PendingUserRepository();
