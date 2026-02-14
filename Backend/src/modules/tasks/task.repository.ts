import Task, { ITask } from './task.model';
import { UpdateQuery } from 'mongoose';

export class TaskRepository {
  async create(taskData: Partial<ITask>): Promise<ITask> {
    const task = await Task.create(taskData);
    return task;
  }

  async findAllByUserId(userId: string): Promise<ITask[]> {
    return await Task.find({ owner: userId }).sort({ createdAt: -1 });
  }

  async findById(taskId: string, userId: string): Promise<ITask | null> {
    return await Task.findOne({ _id: taskId, owner: userId });
  }

  async update(taskId: string, userId: string, updateData: UpdateQuery<ITask>): Promise<ITask | null> {
    return await Task.findOneAndUpdate({ _id: taskId, owner: userId }, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(taskId: string, userId: string): Promise<ITask | null> {
    return await Task.findOneAndDelete({ _id: taskId, owner: userId });
  }
}
