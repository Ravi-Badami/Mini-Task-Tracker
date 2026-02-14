class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details: unknown;
  public timestamp: string;

  constructor(statusCode: number, message: string, isOperational: boolean = true, details: unknown = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toString();
    Error.captureStackTrace(this, this.constructor);
  }

  // 400 - Bad Request
  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, true, details);
  }

  // 401 - Unauthorized
  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  // 403 - Forbidden
  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  // 404 - Not Found
  static notFound(message: string = 'Resource Not Found'): ApiError {
    return new ApiError(404, message);
  }

  // 405 - Method Not Allowed
  static methodNotAllowed(message: string = 'Method not allowed'): ApiError {
    return new ApiError(405, message);
  }

  // 408 - Request Timeout
  static requestTimeout(message: string = 'Request Timeout'): ApiError {
    return new ApiError(408, message);
  }

  // 409 - Conflict
  static conflict(message: string = 'Conflict'): ApiError {
    return new ApiError(409, message);
  }

  // 410 - Gone
  static gone(message: string = 'Resource no longer available'): ApiError {
    return new ApiError(410, message);
  }

  // 413 - Payload Too Large
  static payloadTooLarge(message: string = 'Payload too large'): ApiError {
    return new ApiError(413, message);
  }

  // 415 - Unsupported Media Type
  static unsupportedMediaType(message: string = 'Unsupported media type'): ApiError {
    return new ApiError(415, message);
  }

  // 422 - Unprocessable Entity (Validation error)
  static validationError(message: string = 'Validation failed'): ApiError {
    return new ApiError(422, message);
  }

  // 429 - Too Many Requests
  static tooManyRequests(message: string = 'Too many requests'): ApiError {
    return new ApiError(429, message);
  }

  // 500 - Internal Server Error
  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(500, message);
  }

  // 502 - Bad Gateway
  static badGateway(message: string = 'Bad Gateway'): ApiError {
    return new ApiError(502, message);
  }

  // 503 - Service Unavailable
  static serviceUnavailable(message: string = 'Service unavailable'): ApiError {
    return new ApiError(503, message);
  }

  // 504 - Gateway Timeout
  static gatewayTimeout(message: string = 'Gateway timeout'): ApiError {
    return new ApiError(504, message);
  }
}

export default ApiError;
