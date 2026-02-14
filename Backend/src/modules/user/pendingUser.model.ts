import mongoose, { Document } from 'mongoose';

export interface IPendingUser extends Document {
  name: string;
  email: string;
  password: string;
  verificationToken: string;
  verificationExpires: Date;
  createdAt: Date;
}

const pendingUserSchema = new mongoose.Schema<IPendingUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationToken: { type: String, required: true },
  verificationExpires: { type: Date, required: true, index: { expires: 0 } },
  createdAt: { type: Date, default: Date.now },
});

const PendingUser = mongoose.model<IPendingUser>('PendingUser', pendingUserSchema);

export default PendingUser;
