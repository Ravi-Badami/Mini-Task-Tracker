import { TaskRepository } from './task.repository';
import redisClient from '../../config/redis';
import { ITask } from './task.model';
import ApiError from '../../utils/ApiError';

const CACHE_EXPIRATION = 3600; // 1 hour

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async getTasksByUser(userId: string): Promise<ITask[]> {
    const cacheKey = `tasks:${userId}`;
    const cachedTasks = await redisClient.get(cacheKey);

    if (cachedTasks) {
      return JSON.parse(cachedTasks);
    }

    const tasks = await this.taskRepository.findAllByUserId(userId);
    await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(tasks));

    return tasks;
  }

  async createTask(userId: string, taskData: Partial<ITask>): Promise<ITask> {
    if (!taskData.title) {
      throw ApiError.badRequest('Title is required');
    }

    const task = await this.taskRepository.create({ ...taskData, owner: userId as any });

    // Invalidate cache
    await redisClient.del(`tasks:${userId}`);

    return task;
  }

  async updateTask(userId: string, taskId: string, taskData: Partial<ITask>): Promise<ITask> {
    const task = await this.taskRepository.update(taskId, userId, taskData);

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Invalidate cache
    await redisClient.del(`tasks:${userId}`);

    return task;
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const task = await this.taskRepository.delete(taskId, userId);

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Invalidate cache
    await redisClient.del(`tasks:${userId}`);
  }
}
