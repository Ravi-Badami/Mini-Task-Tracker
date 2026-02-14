import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TaskRepository } from '../../modules/tasks/task.repository';
import Task, { ITask } from '../../modules/tasks/task.model';
import User from '../../modules/user/user.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;
  let userId: string;

  beforeEach(async () => {
    taskRepository = new TaskRepository();
    await Task.deleteMany({});
    await User.deleteMany({});

    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    userId = (user._id as mongoose.Types.ObjectId).toString();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const taskData: Partial<ITask> = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        owner: userId as any,
      };

      const task = await taskRepository.create(taskData);

      expect(task).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.owner.toString()).toBe(userId);
    });
  });

  describe('findAllByUserId', () => {
    it('should return all tasks for a user', async () => {
      await Task.create([
        { title: 'Task 1', owner: userId },
        { title: 'Task 2', owner: userId },
      ]);

      const tasks = await taskRepository.findAllByUserId(userId);

      expect(tasks).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      await Task.create([
        { title: 'Task 1', status: 'pending', owner: userId },
        { title: 'Task 2', status: 'completed', owner: userId },
        { title: 'Task 3', status: 'pending', owner: userId },
      ]);

      const pendingTasks = await taskRepository.findAllByUserId(userId, { status: 'pending' });
      const completedTasks = await taskRepository.findAllByUserId(userId, { status: 'completed' });

      expect(pendingTasks).toHaveLength(2);
      expect(completedTasks).toHaveLength(1);
      expect(completedTasks[0].status).toBe('completed');
    });

    it('should filter tasks by due date range', async () => {
      await Task.create([
        { title: 'Task 1', dueDate: new Date('2026-02-10'), owner: userId },
        { title: 'Task 2', dueDate: new Date('2026-02-15'), owner: userId },
        { title: 'Task 3', dueDate: new Date('2026-02-20'), owner: userId },
        { title: 'Task 4', owner: userId }, // No due date
      ]);

      const filters = {
        dueDateFrom: new Date('2026-02-12'),
        dueDateTo: new Date('2026-02-18'),
      };

      const tasks = await taskRepository.findAllByUserId(userId, filters);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Task 2');
    });

    it('should filter by due date from only', async () => {
      await Task.create([
        { title: 'Task 1', dueDate: new Date('2026-02-10'), owner: userId },
        { title: 'Task 2', dueDate: new Date('2026-02-20'), owner: userId },
        { title: 'Task 3', dueDate: new Date('2026-02-25'), owner: userId },
      ]);

      const tasks = await taskRepository.findAllByUserId(userId, {
        dueDateFrom: new Date('2026-02-15'),
      });

      expect(tasks).toHaveLength(2);
      expect(tasks.some((t) => t.title === 'Task 1')).toBe(false);
    });

    it('should filter by due date to only', async () => {
      await Task.create([
        { title: 'Task 1', dueDate: new Date('2026-02-10'), owner: userId },
        { title: 'Task 2', dueDate: new Date('2026-02-20'), owner: userId },
        { title: 'Task 3', dueDate: new Date('2026-02-25'), owner: userId },
      ]);

      const tasks = await taskRepository.findAllByUserId(userId, {
        dueDateTo: new Date('2026-02-15'),
      });

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Task 1');
    });

    it('should combine status and due date filters', async () => {
      await Task.create([
        { title: 'Task 1', status: 'pending', dueDate: new Date('2026-02-10'), owner: userId },
        { title: 'Task 2', status: 'pending', dueDate: new Date('2026-02-15'), owner: userId },
        { title: 'Task 3', status: 'completed', dueDate: new Date('2026-02-15'), owner: userId },
        { title: 'Task 4', status: 'pending', dueDate: new Date('2026-02-20'), owner: userId },
      ]);

      const tasks = await taskRepository.findAllByUserId(userId, {
        status: 'pending',
        dueDateFrom: new Date('2026-02-12'),
        dueDateTo: new Date('2026-02-18'),
      });

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Task 2');
      expect(tasks[0].status).toBe('pending');
    });
  });

  describe('findById', () => {
    it('should return a task by id', async () => {
      const createdTask = await Task.create({ title: 'Task 1', owner: userId });

      const task = await taskRepository.findById((createdTask._id as mongoose.Types.ObjectId).toString(), userId);

      expect(task).toBeDefined();
      expect(task?.title).toBe('Task 1');
    });

    it('should return null if task not found', async () => {
      const task = await taskRepository.findById(new mongoose.Types.ObjectId().toString(), userId);
      expect(task).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const createdTask = await Task.create({ title: 'Task 1', owner: userId });

      const updatedTask = await taskRepository.update((createdTask._id as mongoose.Types.ObjectId).toString(), userId, {
        title: 'Updated Task',
      });

      expect(updatedTask?.title).toBe('Updated Task');
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const createdTask = await Task.create({ title: 'Task 1', owner: userId });

      const deletedTask = await taskRepository.delete((createdTask._id as mongoose.Types.ObjectId).toString(), userId);

      expect(deletedTask).toBeDefined();

      const foundTask = await Task.findById(createdTask._id);
      expect(foundTask).toBeNull();
    });
  });
});
