import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import UserRepository from './user.repo';
import ApiError from '../../utils/ApiError';
import { IUser } from './user.model';

class UserService {
  async createUser(name: string, email: string, password: string): Promise<IUser> {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw ApiError.conflict('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserRepository.create({ name, email, password: hashedPassword });
    return user;
  }

  async loginUser(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h',
    });
    return { user, token };
  }
}

export default new UserService();
