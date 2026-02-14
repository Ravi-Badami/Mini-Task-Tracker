/// <reference types="jest" />

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../index';
import User from '../../modules/user/user.model';
import RefreshToken from '../../modules/auth/auth.model';

let mongoServer: MongoMemoryServer;

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
});

describe('API Integration Tests', () => {
  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/users/register').send(userData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration successful. Please check your email to verify your account.');
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Register first time
      await request(app).post('/users/register').send(userData).expect(201);

      // Try to register again
      const response = await request(app).post('/users/register').send(userData).expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists');
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
      // Create a test user
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
      // Login to get a refresh token
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        })
        .expect(200);

      refreshToken = loginResponse.body.data.refreshToken;
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
  });

  describe('POST /auth/logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        })
        .expect(200);

      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app).post('/auth/logout').send({ refreshToken }).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /', () => {
    it('should return hello message with visit count', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.text).toContain('Hello! Number of visits:');
    });
  });
});
