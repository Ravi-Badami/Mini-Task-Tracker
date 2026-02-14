import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as taskController from '../../modules/tasks/task.controller';
import { TaskService } from '../../modules/tasks/task.service';

// Mock TaskService
jest.mock('../../modules/tasks/task.service');

describe('TaskController', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = {
      user: { id: 'user123' },
      body: {},
      params: {},
      query: {},
    } as Partial<AuthRequest>;

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return tasks', async () => {
      const tasks = [{ title: 'Task 1' }];
      (TaskService.prototype.getTasksByUser as jest.Mock).mockResolvedValue(tasks);

      await taskController.getTasks(req as AuthRequest, res as Response, jest.fn());

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(tasks);
    });

    it('should call next with error if user not authenticated', async () => {
      req.user = undefined;
      const nextMock = jest.fn();

      await taskController.getTasks(req as AuthRequest, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(expect.any(Error));
      expect(nextMock.mock.calls[0][0].message).toBe('User not authenticated');
    });

    it('should filter tasks by status', async () => {
      const tasks = [{ title: 'Pending Task', status: 'pending' }];
      req.query = { status: 'pending' };
      (TaskService.prototype.getTasksByUser as jest.Mock).mockResolvedValue(tasks);

      await taskController.getTasks(req as AuthRequest, res as Response, jest.fn());

      expect(TaskService.prototype.getTasksByUser).toHaveBeenCalledWith('user123', { status: 'pending' });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(tasks);
    });

    it('should filter tasks by due date range', async () => {
      const tasks = [{ title: 'Task', dueDate: '2026-02-15' }];
      req.query = { dueDateFrom: '2026-02-01', dueDateTo: '2026-02-28' };
      (TaskService.prototype.getTasksByUser as jest.Mock).mockResolvedValue(tasks);

      await taskController.getTasks(req as AuthRequest, res as Response, jest.fn());

      expect(TaskService.prototype.getTasksByUser).toHaveBeenCalledWith('user123', {
        dueDateFrom: new Date('2026-02-01'),
        dueDateTo: new Date('2026-02-28'),
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(tasks);
    });

    it('should filter tasks by status and due date', async () => {
      const tasks = [{ title: 'Pending Task', status: 'pending', dueDate: '2026-02-15' }];
      req.query = { status: 'completed', dueDateFrom: '2026-02-01' };
      (TaskService.prototype.getTasksByUser as jest.Mock).mockResolvedValue(tasks);

      await taskController.getTasks(req as AuthRequest, res as Response, jest.fn());

      expect(TaskService.prototype.getTasksByUser).toHaveBeenCalledWith('user123', {
        status: 'completed',
        dueDateFrom: new Date('2026-02-01'),
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(tasks);
    });
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const newTask = { title: 'New Task' };
      req.body = newTask;
      (TaskService.prototype.createTask as jest.Mock).mockResolvedValue(newTask);

      await taskController.createTask(req as AuthRequest, res as Response, jest.fn());

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(newTask);
    });

    it('should call next with error if user not authenticated', async () => {
      req.user = undefined;
      const nextMock = jest.fn();

      await taskController.createTask(req as AuthRequest, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(expect.any(Error));
      expect(nextMock.mock.calls[0][0].message).toBe('User not authenticated');
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const updatedTask = { title: 'Updated' };
      req.params = { id: 'task123' };
      req.body = updatedTask;
      (TaskService.prototype.updateTask as jest.Mock).mockResolvedValue(updatedTask);

      await taskController.updateTask(req as AuthRequest, res as Response, jest.fn());

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(updatedTask);
    });

    it('should call next with error if user not authenticated', async () => {
      req.user = undefined;
      const nextMock = jest.fn();

      await taskController.updateTask(req as AuthRequest, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(expect.any(Error));
      expect(nextMock.mock.calls[0][0].message).toBe('User not authenticated');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      req.params = { id: 'task123' };

      await taskController.deleteTask(req as AuthRequest, res as Response, jest.fn());

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Task deleted successfully' });
    });

    it('should call next with error if user not authenticated', async () => {
      req.user = undefined;
      const nextMock = jest.fn();

      await taskController.deleteTask(req as AuthRequest, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(expect.any(Error));
      expect(nextMock.mock.calls[0][0].message).toBe('User not authenticated');
    });
  });
});
