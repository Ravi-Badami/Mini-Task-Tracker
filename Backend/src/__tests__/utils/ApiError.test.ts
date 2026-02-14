import ApiError from '../../utils/ApiError';

describe('ApiError', () => {
  describe('badRequest', () => {
    it('should create a bad request error', () => {
      const error = ApiError.badRequest('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('unauthorized', () => {
    it('should create an unauthorized error', () => {
      const error = ApiError.unauthorized('Not authenticated');

      expect(error.message).toBe('Not authenticated');
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('forbidden', () => {
    it('should create a forbidden error', () => {
      const error = ApiError.forbidden('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('notFound', () => {
    it('should create a not found error', () => {
      const error = ApiError.notFound('Resource not found');

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('conflict', () => {
    it('should create a conflict error', () => {
      const error = ApiError.conflict('Resource already exists');

      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('internal', () => {
    it('should create an internal server error', () => {
      const error = ApiError.internal('Something went wrong');

      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('Error properties', () => {
    it('should be an instance of Error', () => {
      const error = ApiError.badRequest('Test');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct name', () => {
      const error = ApiError.badRequest('Test');
      expect(error.name).toBe('ApiError');
    });

    it('should have stack trace', () => {
      const error = ApiError.badRequest('Test');
      expect(error.stack).toBeDefined();
    });
  });
});
