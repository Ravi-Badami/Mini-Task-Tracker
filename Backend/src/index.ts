import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger';
import { connectMongoDB, connectRedis, redisClient } from './config/db';
import userRoutes from './modules/user/user.routes';
import authRouter from './modules/auth/auth.routes';
import ApiError from './utils/ApiError';

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
  try {
    const visits = await redisClient.incr('visits');
    res.send(`Hello! Number of visits: ${visits}`);
  } catch {
    res.status(500).send('Error incrementing visits');
  }
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof ApiError) {
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
  console.log(`Server is running on port ${port}`);
});
