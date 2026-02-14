import { Response } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import ApiError from '../../utils/ApiError';
import Task from './task.model';
import { AuthRequest } from '../../middleware/auth.middleware';
import redisClient from '../../config/redis';

const CACHE_EXPIRATION = 3600; // 1 hour

export const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User not authenticated');
  }

  const cacheKey = `tasks:${req.user.id}`;
  const cachedTasks = await redisClient.get(cacheKey);

  if (cachedTasks) {
    return res.status(200).json(JSON.parse(cachedTasks));
  }

  const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });

  await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(tasks));

  res.status(200).json(tasks);
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User not authenticated');
  }
  const { title, description, status, dueDate } = req.body;

  if (!title) {
    throw ApiError.badRequest('Title is required');
  }

  const task = await Task.create({
    title,
    description,
    status,
    dueDate,
    owner: req.user.id,
  });

  // Invalidate cache
  await redisClient.del(`tasks:${req.user.id}`);

  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User not authenticated');
  }
  const { id } = req.params;
  const { title, description, status, dueDate } = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: id, owner: req.user.id },
    { title, description, status, dueDate },
    { new: true, runValidators: true },
  );

  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  // Invalidate cache
  await redisClient.del(`tasks:${req.user.id}`);

  res.status(200).json(task);
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User not authenticated');
  }
  const { id } = req.params;

  const task = await Task.findOneAndDelete({ _id: id, owner: req.user.id });

  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  // Invalidate cache
  await redisClient.del(`tasks:${req.user.id}`);

  res.status(200).json({ message: 'Task deleted successfully' });
});
