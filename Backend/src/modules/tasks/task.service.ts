import { TaskRepository, TaskFilters } from './task.repository';
import redisClient from '../../config/redis';
import { ITask } from './task.model';
import ApiError from '../../utils/ApiError';

const CACHE_EXPIRATION = 3600; // 1 hour

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async getTasksByUser(userId: string, filters?: TaskFilters): Promise<ITask[]> {
    // Create cache key based on filters
    const filterKey = filters
      ? JSON.stringify({
          status: filters.status,
          dueDateFrom: filters.dueDateFrom?.toISOString(),
          dueDateTo: filters.dueDateTo?.toISOString(),
        })
      : 'all';
    const cacheKey = `tasks:${userId}:${filterKey}`;
    const cachedTasks = await redisClient.get(cacheKey);

    if (cachedTasks) {
      return JSON.parse(cachedTasks);
    }

    const tasks = await this.taskRepository.findAllByUserId(userId, filters);
    await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(tasks));

    return tasks;
  }

  async createTask(userId: string, taskData: Partial<ITask>): Promise<ITask> {
    if (!taskData.title) {
      throw ApiError.badRequest('Title is required');
    }

    const task = await this.taskRepository.create({ ...taskData, owner: userId as any });

    // Invalidate all task caches for this user
    await this.invalidateUserTaskCache(userId);

    return task;
  }

  async updateTask(userId: string, taskId: string, taskData: Partial<ITask>): Promise<ITask> {
    const task = await this.taskRepository.update(taskId, userId, taskData);

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Invalidate all task caches for this user
    await this.invalidateUserTaskCache(userId);

    return task;
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const task = await this.taskRepository.delete(taskId, userId);

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Invalidate all task caches for this user
    await this.invalidateUserTaskCache(userId);
  }

  private async invalidateUserTaskCache(userId: string): Promise<void> {
    // Delete all cache keys matching tasks:userId:*
    const pattern = `tasks:${userId}:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redisClient.del(key)));
    }
  }
}
