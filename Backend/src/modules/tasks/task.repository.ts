import Task, { ITask } from './task.model';
import { UpdateQuery } from 'mongoose';

export interface TaskFilters {
  status?: 'pending' | 'completed';
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

export class TaskRepository {
  async create(taskData: Partial<ITask>): Promise<ITask> {
    const task = await Task.create(taskData);
    return task;
  }

  async findAllByUserId(userId: string, filters?: TaskFilters): Promise<ITask[]> {
    const query: Record<string, any> = { owner: userId };

    // Apply status filter
    if (filters?.status) {
      query.status = filters.status;
    }

    // Apply due date filters
    if (filters?.dueDateFrom || filters?.dueDateTo) {
      query.dueDate = {};
      if (filters.dueDateFrom) {
        query.dueDate.$gte = filters.dueDateFrom;
      }
      if (filters.dueDateTo) {
        query.dueDate.$lte = filters.dueDateTo;
      }
    }

    return await Task.find(query).sort({ createdAt: -1 });
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
