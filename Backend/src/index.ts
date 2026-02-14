import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger';
import { connectMongoDB, connectRedis, redisClient } from './config/db';
import userRoutes from './modules/user/user.routes';
import authRouter from './modules/auth/auth.routes';
import ApiError from './utils/ApiError';
import logger from './utils/logger';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/users', userRoutes);
app.use('/auth', authRouter);

// Initialize database connections
connectMongoDB();
connectRedis();

app.get('/', async (req, res) => {
  logger.info('Root endpoint accessed', { ip: req.ip, userAgent: req.get('User-Agent') });
  try {
    const visits = await redisClient.incr('visits');
    logger.info('Visit counter incremented', { visits });
    res.send(`Hello! Number of visits: ${visits}`);
  } catch (error) {
    logger.error('Error incrementing visits', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).send('Error incrementing visits');
  }
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  if (err instanceof ApiError) {
    logger.warn('API Error handled', {
      statusCode: err.statusCode,
      message: err.message,
      details: err.details,
    });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
      timestamp: err.timestamp,
    });
  }
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(port, () => {
  logger.info('Server started successfully', { port, environment: process.env.NODE_ENV || 'development' });
});
