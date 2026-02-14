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
}

export default new UserRepository();
