import * as bcrypt from 'bcryptjs';
import UserRepository from './user.repo';
import PendingUserRepository from './pendingUser.repo';
import ApiError from '../../utils/ApiError';
import logger from '../../utils/logger';
import AuthService from '../auth/auth.service';

class UserService {
  async createUser(name: string, email: string, password: string) {
    // Only block if a fully verified user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw ApiError.conflict('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert into PendingUser — replaces any existing pending entry,
    // which invalidates the old verification link automatically
    const pendingUser = await AuthService.createPendingRegistration(name, email, hashedPassword);

    logger.info(`Pending registration created for: ${email}`);

    return pendingUser;
  }
}

export default new UserService();
