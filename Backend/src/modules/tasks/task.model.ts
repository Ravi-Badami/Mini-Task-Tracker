import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../user/user.model';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  dueDate?: Date;
  owner: IUser['_id'];
  createdAt: Date;
}

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  dueDate: {
    type: Date,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
taskSchema.index({ owner: 1 });
taskSchema.index({ status: 1 });

const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task;
