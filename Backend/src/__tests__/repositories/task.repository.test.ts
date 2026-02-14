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
