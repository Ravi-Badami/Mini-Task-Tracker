import { Response } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';
import { TaskService } from './task.service';

const taskService = new TaskService();

export const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const tasks = await taskService.getTasksByUser(req.user.id);
  res.status(200).json(tasks);
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const task = await taskService.createTask(req.user.id, req.body);
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const { id } = req.params;
  const task = await taskService.updateTask(req.user.id, id as string, req.body);
  res.status(200).json(task);
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  const { id } = req.params;
  await taskService.deleteTask(req.user.id, id as string);
  res.status(200).json({ message: 'Task deleted successfully' });
});
