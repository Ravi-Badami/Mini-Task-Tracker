// Redis and nodemailer are mocked globally in setup.ts using redis-mock and jest.mock

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import app from '../../index';
import User from '../../modules/user/user.model';
import RefreshToken from '../../modules/auth/auth.model';
import Task from '../../modules/tasks/task.model';
import PendingUser from '../../modules/user/pendingUser.model';

let mongoServer: MongoMemoryServer;

console.log('NODE_ENV:', process.env.NODE_ENV);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
  await Task.deleteMany({});
  await PendingUser.deleteMany({});
});

describe('API Integration Tests', () => {
  // Helper: create a verified user and login to get tokens
  const createUserAndLogin = async () => {
    const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password'
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
    });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    return response.body.data;
  };

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      try {
        const response = await request(app).post('/users/register').send(userData);
        if (response.status !== 201) {
          fs.writeFileSync(
            'api_error_body.json',
            JSON.stringify({ status: response.status, body: response.body }, null, 2),
          );
        }
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Registration successful. Please check your email to verify your account.');
      } catch (error: unknown) {
        const err = error as Error;
        fs.writeFileSync('error_log.json', JSON.stringify({ error: err.message, stack: err.stack }, null, 2));
        throw error;
      }
    });

    it('should allow re-registration for pending (unverified) users', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Register first time - creates PendingUser
      await request(app).post('/users/register').send(userData).expect(201);

      // Register again - upserts into PendingUser (should succeed, not 409)
      const response = await request(app).post('/users/register').send(userData).expect(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 409 for already verified user', async () => {
      // Create a verified user directly
      await User.create({
        name: 'Verified User',
        email: 'verified@example.com',
        password: 'hashed-password',
      });

      const response = await request(app)
        .post('/users/register')
        .send({
          name: 'Verified User',
          email: 'verified@example.com',
          password: 'password123',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should validate input data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123',
      };

      const response = await request(app).post('/users/register').send(invalidData).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password'
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      });
    });

    it('should login successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password',
      };

      const response = await request(app).post('/auth/login').send(loginData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app).post('/auth/login').send(loginData).expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const tokens = await createUserAndLogin();
      refreshToken = tokens.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app).post('/auth/refresh').send({ refreshToken }).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.refreshToken).not.toBe(refreshToken);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app).post('/auth/refresh').send({ refreshToken: 'invalid-token' }).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should detect replay attack and revoke family', async () => {
      // First refresh succeeds
      const firstRefresh = await request(app).post('/auth/refresh').send({ refreshToken }).expect(200);
      const newRefreshToken = firstRefresh.body.data.refreshToken;

      // Try to reuse the old token (replay attack)
      await request(app).post('/auth/refresh').send({ refreshToken }).expect(401);

      // Even the new token should now be revoked (family revocation)
      await request(app).post('/auth/refresh').send({ refreshToken: newRefreshToken }).expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const tokens = await createUserAndLogin();
      refreshToken = tokens.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app).post('/auth/logout').send({ refreshToken }).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should invalidate refresh token after logout', async () => {
      await request(app).post('/auth/logout').send({ refreshToken }).expect(200);

      // Token should no longer work
      await request(app).post('/auth/refresh').send({ refreshToken }).expect(401);
    });
  });

  describe('Task CRUD - /api/tasks', () => {
    let accessToken: string;

    beforeEach(async () => {
      const tokens = await createUserAndLogin();
      accessToken = tokens.accessToken;
    });

    it('should reject unauthenticated access', async () => {
      await request(app).get('/api/tasks').expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app).get('/api/tasks').set('Authorization', 'Bearer invalid-token').expect(401);
    });

    it('should return empty tasks list initially', async () => {
      const response = await request(app).get('/api/tasks').set('Authorization', `Bearer ${accessToken}`).expect(200);

      expect(response.body).toEqual([]);
    });

    it('should create a new task', async () => {
      const taskData = {
        title: 'Integration Test Task',
        description: 'Created during integration test',
        status: 'pending',
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.status).toBe('pending');
      expect(response.body._id).toBeDefined();
    });

    it('should get all tasks for authenticated user', async () => {
      // Create two tasks
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Task 1' })
        .expect(201);

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Task 2' })
        .expect(201);

      const response = await request(app).get('/api/tasks').set('Authorization', `Bearer ${accessToken}`).expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should update a task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Original Title' })
        .expect(201);

      const taskId = createRes.body._id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Title', status: 'completed' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.status).toBe('completed');
    });

    it('should delete a task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'To Delete' })
        .expect(201);

      const taskId = createRes.body._id;

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');
    });

    it('should not access tasks of another user', async () => {
      // Create a task with the first user
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Private Task' })
        .expect(201);

      const taskId = createRes.body._id;

      // Create another user and login
      await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      });

      const otherLogin = await request(app)
        .post('/auth/login')
        .send({ email: 'other@example.com', password: 'password' })
        .expect(200);

      const otherToken = otherLogin.body.data.accessToken;

      // Other user should get empty tasks list
      const otherTasks = await request(app).get('/api/tasks').set('Authorization', `Bearer ${otherToken}`).expect(200);

      expect(otherTasks.body).toHaveLength(0);

      // Other user should not be able to update/delete first user's task
      await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked' })
        .expect(404);

      await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${otherToken}`).expect(404);
    });
  });

  describe('GET /', () => {
    it('should return hello message with visit count', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.text).toContain('Hello! Number of visits:');
    });
  });
});
