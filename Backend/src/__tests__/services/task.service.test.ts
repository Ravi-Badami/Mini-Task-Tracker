import { TaskService } from '../../modules/tasks/task.service';
import { TaskRepository } from '../../modules/tasks/task.repository';
import redisClient from '../../config/redis';
import ApiError from '../../utils/ApiError';

// Mock TaskRepository (Redis is mocked globally in setup.ts using redis-mock)
jest.mock('../../modules/tasks/task.repository');

describe('TaskService', () => {
  let taskService: TaskService;
  let taskRepository: jest.Mocked<TaskRepository>;

  beforeEach(async () => {
    taskRepository = new TaskRepository() as jest.Mocked<TaskRepository>;
    taskService = new TaskService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (taskService as any).taskRepository = taskRepository;

    // Clear mocks and Redis cache before each test
    jest.clearAllMocks();
    // Clear redis-mock cache
    await redisClient.flushAll();
  });

  describe('getTasksByUser', () => {
    it('should return cached tasks if available', async () => {
      const userId = 'user123';
      const cachedTasks = [{ title: 'Cached Task' }];

      // Pre-populate the cache using redis-mock
      await redisClient.setEx(`tasks:${userId}`, 3600, JSON.stringify(cachedTasks));

      const result = await taskService.getTasksByUser(userId);

      expect(result).toEqual(cachedTasks);
      expect(taskRepository.findAllByUserId).not.toHaveBeenCalled();
    });

    it('should fetch from repository if cache miss', async () => {
      const userId = 'user123';
      const dbTasks = [{ title: 'DB Task' }];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      taskRepository.findAllByUserId.mockResolvedValue(dbTasks as any);

      const result = await taskService.getTasksByUser(userId);

      expect(result).toEqual(dbTasks);
      expect(taskRepository.findAllByUserId).toHaveBeenCalledWith(userId);

      // Verify the result was cached
      const cached = await redisClient.get(`tasks:${userId}`);
      expect(JSON.parse(cached as string)).toEqual(dbTasks);
    });
  });

  describe('createTask', () => {
    it('should create task and invalidate cache', async () => {
      const userId = 'user123';
      const taskData = { title: 'New Task' };
      const createdTask = { ...taskData, _id: 'task123' };

      // Pre-populate cache
      await redisClient.setEx(`tasks:${userId}`, 3600, JSON.stringify([{ title: 'Old Task' }]));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      taskRepository.create.mockResolvedValue(createdTask as any);

      const result = await taskService.createTask(userId, taskData);

      expect(result).toEqual(createdTask);

      // Verify cache was invalidated
      const cached = await redisClient.get(`tasks:${userId}`);
      expect(cached).toBeNull();
    });

    it('should throw error if title is missing', async () => {
      const userId = 'user123';
      await expect(taskService.createTask(userId, {})).rejects.toThrow(ApiError);
    });
  });

  describe('updateTask', () => {
    it('should update task and invalidate cache', async () => {
      const userId = 'user123';
      const taskId = 'task123';
      const updateData = { title: 'Updated' };
      const updatedTask = { _id: taskId, ...updateData };

      // Pre-populate cache
      await redisClient.setEx(`tasks:${userId}`, 3600, JSON.stringify([{ title: 'Old Task' }]));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      taskRepository.update.mockResolvedValue(updatedTask as any);

      const result = await taskService.updateTask(userId, taskId, updateData);

      expect(result).toEqual(updatedTask);

      // Verify cache was invalidated
      const cached = await redisClient.get(`tasks:${userId}`);
      expect(cached).toBeNull();
    });

    it('should throw error if task not found', async () => {
      taskRepository.update.mockResolvedValue(null);

      await expect(taskService.updateTask('uid', 'tid', { title: 'U' })).rejects.toThrow(ApiError);
    });
  });

  describe('deleteTask', () => {
    it('should delete task and invalidate cache', async () => {
      const userId = 'user123';
      const taskId = 'task123';

      // Pre-populate cache
      await redisClient.setEx(`tasks:${userId}`, 3600, JSON.stringify([{ title: 'Task to delete' }]));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      taskRepository.delete.mockResolvedValue({ _id: taskId } as any);

      await taskService.deleteTask(userId, taskId);

      // Verify cache was invalidated
      const cached = await redisClient.get(`tasks:${userId}`);
      expect(cached).toBeNull();
    });

    it('should throw error if task not found', async () => {
      taskRepository.delete.mockResolvedValue(null);

      await expect(taskService.deleteTask('uid', 'tid')).rejects.toThrow(ApiError);
    });
  });
});
