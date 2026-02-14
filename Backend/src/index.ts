import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger';
import { connectMongoDB, connectRedis } from './config/db';
import userRoutes from './modules/user/user.routes';
import authRouter from './modules/auth/auth.routes';
import taskRoutes from './modules/tasks/task.routes';
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
app.use('/api/tasks', taskRoutes);

// Root route for testing/demo
app.get('/', (req, res) => {
  res.send('Hello! Number of visits: 1');
});

// Handle old/misconfigured verification links
app.get('/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token) {
    res.status(400).send('Invalid link');
    return;
  }
  res.redirect(`/auth/verify-email?token=${token}`);
});

// Export app for testing
export default app;

// Initialize database connections and start server (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await connectMongoDB();
      await connectRedis();

      app.listen(port, () => {
        logger.info('Server started successfully', { port, environment: process.env.NODE_ENV || 'development' });
      });
    } catch (error) {
      logger.error('Failed to start server due to connection error', { error });
      process.exit(1);
    }
  })();
}
