# Test Configuration

This directory contains all test files for the backend application.

## Mocking Libraries

### MongoDB - `mongodb-memory-server`
We use `mongodb-memory-server` to create an in-memory MongoDB instance for testing. This provides:
- **Real MongoDB instance**: Tests run against an actual MongoDB database in memory
- **Isolation**: Each test suite gets a fresh database instance
- **Speed**: In-memory database is faster than disk-based MongoDB
- **No external dependencies**: Tests don't require a running MongoDB server

**Usage in tests:**
```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

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
  // Clear all collections before each test
  await Model.deleteMany({});
});
```

### Redis - `redis-mock`
We use `redis-mock` to mock Redis operations. This is configured globally in `setup.ts` and provides:
- **Full Redis API**: Implements actual Redis commands (get, set, del, etc.)
- **In-memory storage**: No external Redis server needed
- **Consistent behavior**: All Redis operations work as expected
- **Automatic cleanup**: Can be cleared between tests using `flushAll()`

**Global Configuration:**
The Redis mock is configured in `setup.ts` and automatically applied to all tests. You don't need to mock Redis in individual test files.

**Usage in tests:**
```typescript
import redisClient from '../../config/redis';

beforeEach(async () => {
  // Clear Redis cache before each test
  await redisClient.flushAll();
});

// Test with actual redis-mock behavior
it('should cache data', async () => {
  await redisClient.setEx('key', 3600, 'value');
  const result = await redisClient.get('key');
  expect(result).toBe('value');
});
```

### Email - `nodemailer`
Nodemailer is mocked globally in `setup.ts` to prevent actual email sending during tests:
```typescript
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    verify: jest.fn().mockResolvedValue(true),
  }),
}));
```

## Test Structure

```
__tests__/
├── setup.ts                 # Global test configuration and mocks
├── README.md               # This file
├── controllers/            # Controller unit tests
├── services/              # Service layer tests
├── repositories/          # Repository/data access tests
├── middleware/            # Middleware tests
├── utils/                 # Utility function tests
├── validation/            # Validation schema tests
└── integration/           # End-to-end API tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.service.test.ts
```

## Best Practices

1. **Use `beforeEach` for cleanup**: Clear MongoDB collections and Redis cache before each test
2. **Test isolation**: Each test should be independent and not rely on other tests
3. **Mock external services**: Always mock email, external APIs, and other I/O operations
4. **Use MongoMemoryServer for DB tests**: Provides real MongoDB behavior without external dependencies
5. **Use redis-mock for cache tests**: Provides real Redis operations in memory
6. **Clear mocks**: Use `jest.clearAllMocks()` in `beforeEach` to reset mock state
